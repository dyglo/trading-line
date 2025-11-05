import type { Request, Response } from "express";
import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { getUserWithProfile, serializeUser } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { onboardingSubmissionSchema } from "../validators/auth.js";

const onboardingRouter = Router();

class OnboardingValidationError extends Error {
  statusCode = 400;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

onboardingRouter.get(
  "/questions",
  requireAuth,
  asyncHandler(async (_req: Request, res: Response) => {
    const questions = await prisma.onboardingQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" }
        }
      }
    });

    return res.json({ questions });
  })
);

onboardingRouter.post(
  "/submit",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const result = onboardingSubmissionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid onboarding payload.",
        error: result.error.flatten()
      });
    }

    const responses = result.data.responses;
    const userId = req.authUser!.id;
    const questionIds = [...new Set(responses.map((response) => response.questionId))];

    const questions = await prisma.onboardingQuestion.findMany({
      where: {
        id: { in: questionIds },
        isActive: true
      },
      include: {
        options: true
      }
    });

    const questionMap = new Map(questions.map((question) => [question.id, question]));

    for (const response of responses) {
      if (!questionMap.has(response.questionId)) {
        throw new OnboardingValidationError("One or more questions are invalid or inactive.", response.questionId);
      }
    }

    const records: Array<{ userId: string; questionId: string; optionId?: string; freeText?: string }> = [];

    for (const response of responses) {
      const question = questionMap.get(response.questionId)!;
      const selectableOptions = new Set(question.options.map((option) => option.id));
      const uniqueOptionIds = response.optionIds ? Array.from(new Set(response.optionIds)) : [];
      const trimmedFreeText = response.freeText?.trim() ?? "";

      switch (question.type) {
        case "FREE_TEXT": {
          if (!trimmedFreeText) {
            throw new OnboardingValidationError(`Question "${question.prompt}" requires a written answer.`);
          }
          records.push({
            userId,
            questionId: question.id,
            freeText: trimmedFreeText
          });
          break;
        }
        case "SINGLE_SELECT": {
          if (uniqueOptionIds.length !== 1) {
            throw new OnboardingValidationError(`Question "${question.prompt}" requires exactly one selection.`);
          }

          const [selectedOption] = uniqueOptionIds;

          if (!selectableOptions.has(selectedOption)) {
            throw new OnboardingValidationError(`Invalid option selected for "${question.prompt}".`);
          }

          records.push({
            userId,
            questionId: question.id,
            optionId: selectedOption
          });
          break;
        }
        case "MULTI_SELECT": {
          if (uniqueOptionIds.length === 0) {
            throw new OnboardingValidationError(`Question "${question.prompt}" requires at least one selection.`);
          }

          for (const optionId of uniqueOptionIds) {
            if (!selectableOptions.has(optionId)) {
              throw new OnboardingValidationError(`Invalid option selected for "${question.prompt}".`, optionId);
            }

            records.push({
              userId,
              questionId: question.id,
              optionId
            });
          }
          break;
        }
        default: {
          throw new OnboardingValidationError(`Unsupported question type: ${question.type}`);
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.userOnboardingResponse.deleteMany({
        where: { userId }
      });

      if (records.length > 0) {
        await tx.userOnboardingResponse.createMany({
          data: records
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { isOnboardingComplete: true }
      });
    });

    const user = await getUserWithProfile(userId);

    return res.json({
      message: "Onboarding responses saved.",
      user: user ? serializeUser(user) : null
    });
  })
);

export default onboardingRouter;

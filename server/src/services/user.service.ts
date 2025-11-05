import type { Prisma } from "@prisma/client";

import { prisma } from "../prisma.js";

export const userWithProfileSelect = {
  id: true,
  username: true,
  email: true,
  isOnboardingComplete: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  preference: true,
  onboardingResponses: {
    include: {
      option: true,
      question: true
    }
  }
} satisfies Prisma.UserSelect;

export const getUserWithProfile = (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: userWithProfileSelect
  });

export type UserWithProfile = Prisma.UserGetPayload<{ select: typeof userWithProfileSelect }>;

export const serializeUser = (user: UserWithProfile) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  isOnboardingComplete: user.isOnboardingComplete,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  preference: user.preference,
  onboardingResponses: user.onboardingResponses.map((response) => ({
    id: response.id,
    questionId: response.questionId,
    optionId: response.optionId,
    freeText: response.freeText,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    question: response.question
      ? {
          id: response.question.id,
          prompt: response.question.prompt,
          type: response.question.type,
          order: response.question.order
        }
      : null,
    option: response.option
      ? {
          id: response.option.id,
          label: response.option.label,
          value: response.option.value
        }
      : null
  }))
});

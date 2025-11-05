import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { getUserWithProfile, serializeUser } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updatePreferencesSchema, updateProfileSchema } from "../validators/auth.js";

const profileRouter = Router();

const collectPreferenceUpdates = (data: Record<string, unknown>) => {
  const updates: Record<string, unknown> = {};

  if (typeof data.startingBalance === "number") {
    updates.startingBalance = new Prisma.Decimal(data.startingBalance);
  }

  if (typeof data.currentBalance === "number") {
    updates.currentBalance = new Prisma.Decimal(data.currentBalance);
  }

  if (typeof data.baseCurrency === "string") {
    updates.baseCurrency = data.baseCurrency.toUpperCase();
  }

  if (typeof data.autoResetOnStopOut === "boolean") {
    updates.autoResetOnStopOut = data.autoResetOnStopOut;
  }

  if (typeof data.notificationsEnabled === "boolean") {
    updates.notificationsEnabled = data.notificationsEnabled;
  }

  return updates;
};

profileRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserWithProfile(req.authUser!.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: serializeUser(user) });
  })
);

profileRouter.patch(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid profile update payload.",
        error: result.error.flatten()
      });
    }

    const updateData: { username?: string; email?: string } = {};

    if (result.data.username) {
      updateData.username = result.data.username.trim();
    }

    if (result.data.email) {
      updateData.email = result.data.email.trim().toLowerCase();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    if (updateData.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: {
            equals: updateData.username,
            mode: "insensitive"
          },
          NOT: { id: req.authUser!.id }
        },
        select: { id: true }
      });

      if (existingUsername) {
        return res.status(409).json({ message: "Username is already taken." });
      }
    }

    if (updateData.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: req.authUser!.id }
        },
        select: { id: true }
      });

      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use." });
      }
    }

    await prisma.user.update({
      where: { id: req.authUser!.id },
      data: updateData
    });

    const user = await getUserWithProfile(req.authUser!.id);

    return res.json({
      message: "Profile updated.",
      user: user ? serializeUser(user) : null
    });
  })
);

profileRouter.patch(
  "/preferences",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const result = updatePreferencesSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid preferences payload.",
        error: result.error.flatten()
      });
    }

    const updates = collectPreferenceUpdates(result.data);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes to apply." });
    }

    await prisma.userPreference.upsert({
      where: { userId: req.authUser!.id },
      update: updates,
      create: {
        userId: req.authUser!.id,
        ...updates
      }
    });

    const user = await getUserWithProfile(req.authUser!.id);

    return res.json({
      message: "Preferences updated.",
      user: user ? serializeUser(user) : null
    });
  })
);

profileRouter.post(
  "/preferences/reset",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.authUser!.id }
    });

    if (!preference) {
      await prisma.userPreference.create({
        data: {
          userId: req.authUser!.id
        }
      });
    } else {
      await prisma.userPreference.update({
        where: { userId: req.authUser!.id },
        data: {
          currentBalance: preference.startingBalance
        }
      });
    }

    const user = await getUserWithProfile(req.authUser!.id);

    return res.json({
      message: "Balance reset to starting value.",
      user: user ? serializeUser(user) : null
    });
  })
);

export default profileRouter;

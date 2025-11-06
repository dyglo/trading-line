import type { Request, Response } from "express";
import { Router } from "express";

import { getSessionTokenFromRequest, requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import {
  createSession,
  deleteSessionById,
  deleteSessionByToken,
  findSessionWithUserByToken,
  isSessionExpired,
  purgeExpiredSessionsForUser,
  rotateSessionToken
} from "../services/session.service.js";
import { getUserWithProfile, serializeUser, userWithProfileSelect } from "../services/user.service.js";
import { clearSessionCookie, setSessionCookie } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { loginSchema, registerSchema } from "../validators/auth.js";

const authRouter = Router();

const validationErrorResponse = (res: Response, error: unknown) =>
  res.status(400).json({
    message: "Invalid request payload.",
    error
  });

const issueSessionCookie = async (req: Request, res: Response, userId: string) => {
  const { token } = await createSession({
    userId,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip
  });

  setSessionCookie(res, token);
};

authRouter.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return validationErrorResponse(res, result.error.flatten());
    }

    const username = result.data.username.trim();
    const email = result.data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: username,
              mode: "insensitive"
            }
          },
          { email }
        ]
      },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username or email is already in use." });
    }

    const passwordHash = await hashPassword(result.data.password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        lastLoginAt: new Date(),
        preference: {
          create: {}
        }
      },
      select: userWithProfileSelect
    });

    await issueSessionCookie(req, res, user.id);

    return res.status(201).json({
      message: "Account created successfully.",
      user: serializeUser(user)
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return validationErrorResponse(res, result.error.flatten());
    }

    const identifier = result.data.emailOrUsername.trim();
    const lowered = identifier.toLowerCase();

    const userRecord = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lowered },
          {
            username: {
              equals: identifier,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!userRecord) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    const isPasswordValid = await verifyPassword(result.data.password, userRecord.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    await purgeExpiredSessionsForUser(userRecord.id);

    const user = await getUserWithProfile(userRecord.id);

    if (!user) {
      return res.status(500).json({ message: "Failed to fetch user profile after login." });
    }

    await prisma.user.update({
      where: { id: userRecord.id },
      data: { lastLoginAt: new Date() }
    });

    await issueSessionCookie(req, res, userRecord.id);

    return res.json({
      message: "Login successful.",
      user: serializeUser(user)
    });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const sessionToken = getSessionTokenFromRequest(req);

    if (!sessionToken) {
      return res.status(401).json({ message: "Session token missing." });
    }

    const session = await findSessionWithUserByToken(sessionToken);

    if (!session || !session.user) {
      clearSessionCookie(res);
      return res.status(401).json({ message: "Session not found." });
    }

    if (isSessionExpired(session)) {
      await deleteSessionById(session.id);
      clearSessionCookie(res);
      return res.status(401).json({ message: "Session expired." });
    }

    const { token: rotatedToken } = await rotateSessionToken(session.id);
    setSessionCookie(res, rotatedToken);

    const user = await getUserWithProfile(session.userId);

    if (!user) {
      await deleteSessionById(session.id);
      clearSessionCookie(res);
      return res.status(401).json({ message: "User no longer exists." });
    }

    return res.json({
      message: "Session refreshed.",
      user: serializeUser(user)
    });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const sessionToken = getSessionTokenFromRequest(req);

    if (sessionToken) {
      await deleteSessionByToken(sessionToken);
    } else if (req.sessionId) {
      await deleteSessionById(req.sessionId);
    }

    clearSessionCookie(res);

    return res.status(204).send();
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const sessionToken = getSessionTokenFromRequest(req);

    if (!sessionToken) {
      return res.json({ user: null });
    }

    const session = await findSessionWithUserByToken(sessionToken);

    if (!session || !session.user || isSessionExpired(session)) {
      if (session) {
        await deleteSessionById(session.id);
      }
      clearSessionCookie(res);
      return res.json({ user: null });
    }

    const user = await getUserWithProfile(session.userId);

    if (!user) {
      await deleteSessionById(session.id);
      clearSessionCookie(res);
      return res.json({ user: null });
    }

    return res.json({ user: serializeUser(user) });
  })
);

export default authRouter;

import type { Request, Response } from "express";
import { Router } from "express";

import { REFRESH_TOKEN_COOKIE } from "../constants.js";
import { getAccessTokenFromRequest, requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import {
  createSession,
  deleteSessionById,
  findSessionById,
  generateSessionId,
  updateSessionRefreshToken,
  validateRefreshToken
} from "../services/session.service.js";
import { getUserWithProfile, serializeUser, userWithProfileSelect } from "../services/user.service.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { loginSchema, registerSchema } from "../validators/auth.js";

const authRouter = Router();

const validationErrorResponse = (res: Response, error: unknown) =>
  res.status(400).json({
    message: "Invalid request payload.",
    error
  });

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
        preference: {
          create: {}
        }
      },
      select: userWithProfileSelect
    });

    const sessionId = generateSessionId();
    const accessToken = signAccessToken({
      sub: user.id,
      sessionId,
      username: user.username,
      email: user.email,
      isOnboardingComplete: user.isOnboardingComplete
    });
    const refreshToken = signRefreshToken({ sub: user.id, sessionId });

    await createSession({
      sessionId,
      userId: user.id,
      refreshToken,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: "Account created successfully.",
      user: serializeUser(user)
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return validationErrorResponse(res, result.error.flatten());
      }

      const identifier = result.data.emailOrUsername.trim();
      const lowered = identifier.toLowerCase();

      const user = await prisma.user.findFirst({
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
          ...userWithProfileSelect,
          passwordHash: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const passwordValid = await verifyPassword(result.data.password, user.passwordHash);

      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const sessionId = generateSessionId();
      const accessToken = signAccessToken({
        sub: user.id,
        sessionId,
        username: user.username,
        email: user.email,
        isOnboardingComplete: user.isOnboardingComplete
      });
      const refreshToken = signRefreshToken({ sub: user.id, sessionId });

      await createSession({
        sessionId,
        userId: user.id,
        refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      setAuthCookies(res, accessToken, refreshToken);

      return res.json({
        message: "Login successful.",
        user: serializeUser(user)
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw to be caught by asyncHandler
    }
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing." });
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const session = await findSessionById(payload.sessionId);

    if (!session || session.userId !== payload.sub) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Session not found." });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await deleteSessionById(session.id);
      clearAuthCookies(res);
      return res.status(401).json({ message: "Session expired." });
    }

    const isValid = await validateRefreshToken(session.refreshToken, refreshToken);

    if (!isValid) {
      await deleteSessionById(session.id);
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token mismatch." });
    }

    const user = await getUserWithProfile(session.userId);

    if (!user) {
      await deleteSessionById(session.id);
      clearAuthCookies(res);
      return res.status(401).json({ message: "User no longer exists." });
    }

    const newAccessToken = signAccessToken({
      sub: user.id,
      sessionId: session.id,
      username: user.username,
      email: user.email,
      isOnboardingComplete: user.isOnboardingComplete
    });
    const newRefreshToken = signRefreshToken({ sub: user.id, sessionId: session.id });

    await updateSessionRefreshToken(session.id, newRefreshToken);

    setAuthCookies(res, newAccessToken, newRefreshToken);

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
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await deleteSessionById(payload.sessionId);
      } catch {
        // ignore decoding issues and continue to clear cookies
      }
    } else if (req.sessionId) {
      await deleteSessionById(req.sessionId);
    }

    clearAuthCookies(res);

    return res.status(204).send();
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const token = getAccessTokenFromRequest(req);

    if (!token) {
      return res.json({ user: null });
    }

    try {
      const payload = verifyAccessToken(token);

      const user = await getUserWithProfile(payload.sub);

      if (!user) {
        clearAuthCookies(res);
        return res.json({ user: null });
      }

      return res.json({ user: serializeUser(user) });
    } catch (error) {
      clearAuthCookies(res);
      return res.json({ user: null });
    }
  })
);

export default authRouter;

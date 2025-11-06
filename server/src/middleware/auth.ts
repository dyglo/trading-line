import type { NextFunction, Request, Response } from "express";

import { SESSION_TOKEN_COOKIE } from "../constants.js";
import {
  deleteSessionById,
  findSessionWithUserByToken,
  isSessionExpired,
  touchSession
} from "../services/session.service.js";
import { clearSessionCookie } from "../utils/cookies.js";

export const getSessionTokenFromRequest = (req: Request) => {
  const fromCookie = req.cookies?.[SESSION_TOKEN_COOKIE];

  if (typeof fromCookie === "string" && fromCookie.length > 0) {
    return fromCookie;
  }

  const fromHeader = req.headers.authorization;

  if (fromHeader && fromHeader.startsWith("Bearer ")) {
    return fromHeader.replace("Bearer ", "").trim();
  }

  return null;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = getSessionTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const session = await findSessionWithUserByToken(token);

    if (!session || !session.user) {
      clearSessionCookie(res);
      return res.status(401).json({ message: "Invalid session." });
    }

    if (isSessionExpired(session)) {
      await deleteSessionById(session.id);
      clearSessionCookie(res);
      return res.status(401).json({ message: "Session expired." });
    }

    req.authUser = {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      isOnboardingComplete: session.user.isOnboardingComplete
    };
    req.sessionId = session.id;

    // Best effort update – failure should not block the request.
    touchSession(session.id).catch(() => undefined);

    return next();
  } catch (error) {
    console.error("Failed to validate session", error);
    clearSessionCookie(res);
    return res.status(401).json({ message: "Authentication required." });
  }
};

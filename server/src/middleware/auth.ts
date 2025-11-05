import type { NextFunction, Request, Response } from "express";

import { ACCESS_TOKEN_COOKIE } from "../constants.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const getAccessTokenFromRequest = (req: Request) => {
  const fromCookie = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (typeof fromCookie === "string" && fromCookie.length > 0) {
    return fromCookie;
  }

  const fromHeader = req.headers.authorization;

  if (fromHeader && fromHeader.startsWith("Bearer ")) {
    return fromHeader.replace("Bearer ", "").trim();
  }

  return null;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(token);
    req.authUser = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      isOnboardingComplete: payload.isOnboardingComplete
    };
    req.sessionId = payload.sessionId;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }
};

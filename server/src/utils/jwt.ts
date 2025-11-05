import jwt from "jsonwebtoken";

import { env } from "../env.js";

export interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  username: string;
  email: string;
  isOnboardingComplete: boolean;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTokenExpiresIn });

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTokenExpiresIn });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;

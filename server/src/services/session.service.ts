import { randomUUID } from "node:crypto";

import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { hashToken, verifyToken } from "../utils/password.js";

interface CreateSessionParams {
  userId: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  sessionId?: string;
}

export const generateSessionId = () => randomUUID();

const calculateRefreshExpiry = () => {
  // env.jwt.refreshTokenExpiresIn is already a number (in seconds)
  const expiresInSeconds = typeof env.jwt.refreshTokenExpiresIn === 'number' 
    ? env.jwt.refreshTokenExpiresIn 
    : Number.parseInt(String(env.jwt.refreshTokenExpiresIn), 10);
  
  if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
    // Default to 7 days if invalid
    return new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);
  }
  
  return new Date(Date.now() + expiresInSeconds * 1000);
};

export const createSession = async ({
  userId,
  refreshToken,
  userAgent,
  ipAddress,
  sessionId = generateSessionId()
}: CreateSessionParams) => {
  const hashedRefresh = await hashToken(refreshToken);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken: hashedRefresh,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt: calculateRefreshExpiry()
    }
  });

  return sessionId;
};

export const updateSessionRefreshToken = async (sessionId: string, refreshToken: string) => {
  const hashedRefresh = await hashToken(refreshToken);

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      refreshToken: hashedRefresh,
      expiresAt: calculateRefreshExpiry()
    }
  });
};

export const findSessionById = async (sessionId: string) =>
  prisma.session.findUnique({
    where: { id: sessionId }
  });

export const deleteSessionById = async (sessionId: string) =>
  prisma.session.deleteMany({
    where: { id: sessionId }
  });

export const validateRefreshToken = async (storedHash: string, providedToken: string) =>
  verifyToken(providedToken, storedHash);

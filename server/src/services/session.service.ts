import { createHash, randomBytes } from "node:crypto";

import type { Prisma, Session } from "@prisma/client";

import { prisma } from "../prisma.js";
import { env } from "../env.js";

const SESSION_TOKEN_BYTE_LENGTH = 36;

const authUserSelect = {
  id: true,
  username: true,
  email: true,
  isOnboardingComplete: true
} satisfies Prisma.UserSelect;

export type SessionWithAuthUser = Prisma.SessionGetPayload<{
  include: { user: { select: typeof authUserSelect } };
}>;

const generateSessionToken = () => randomBytes(SESSION_TOKEN_BYTE_LENGTH).toString("hex");
const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

const futureExpiry = () => new Date(Date.now() + env.session.ttlMs);

interface CreateSessionParams {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export const createSession = async ({ userId, userAgent, ipAddress }: CreateSessionParams) => {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.create({
    data: {
      tokenHash,
      userId,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt: futureExpiry(),
      lastUsedAt: new Date()
    }
  });

  return { session, token };
};

export const findSessionById = (sessionId: string) =>
  prisma.session.findUnique({
    where: { id: sessionId }
  });

export const findSessionWithUserByToken = async (token: string) => {
  const tokenHash = hashSessionToken(token);

  return prisma.session.findUnique({
    where: { tokenHash },
    include: { user: { select: authUserSelect } }
  });
};

export const deleteSessionById = (sessionId: string) =>
  prisma.session.deleteMany({
    where: { id: sessionId }
  });

export const deleteSessionByToken = async (token: string) => {
  const tokenHash = hashSessionToken(token);

  await prisma.session.deleteMany({
    where: { tokenHash }
  });
};

export const rotateSessionToken = async (sessionId: string) => {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      tokenHash,
      expiresAt: futureExpiry(),
      lastUsedAt: new Date()
    }
  });

  return { session, token };
};

export const touchSession = (sessionId: string) =>
  prisma.session.update({
    where: { id: sessionId },
    data: {
      lastUsedAt: new Date()
    }
  });

export const purgeExpiredSessionsForUser = (userId: string) =>
  prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date()
      }
    }
  });

export const isSessionExpired = (session: Pick<Session, "expiresAt">) => session.expiresAt.getTime() <= Date.now();

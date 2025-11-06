/* eslint-disable @typescript-eslint/no-namespace */
import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: User["id"];
      username: User["username"];
      email: User["email"];
      isOnboardingComplete: User["isOnboardingComplete"];
    }

    interface Request {
      authUser?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

export {};


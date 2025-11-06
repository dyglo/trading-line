import type { Response } from "express";

import { COOKIE_PATH, SESSION_TOKEN_COOKIE } from "../constants.js";
import { env } from "../env.js";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: (env.cookies.secure ? "none" : "lax") as "lax" | "none",
  secure: env.cookies.secure,
  // Only set domain if explicitly provided, otherwise let browser handle it
  // This is important for Vercel where domain should be undefined
  ...(env.cookies.domain ? { domain: env.cookies.domain } : {}),
  path: COOKIE_PATH
};

export const setSessionCookie = (res: Response, sessionToken: string) => {
  res.cookie(SESSION_TOKEN_COOKIE, sessionToken, {
    ...baseCookieOptions,
    maxAge: env.session.ttlMs
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie(SESSION_TOKEN_COOKIE, baseCookieOptions);
};

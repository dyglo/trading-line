import type { Response } from "express";

import { ACCESS_TOKEN_COOKIE, COOKIE_PATH, REFRESH_TOKEN_COOKIE } from "../constants.js";
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

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const accessTokenMaxAge = typeof env.jwt.accessTokenExpiresIn === 'number' 
    ? env.jwt.accessTokenExpiresIn * 1000
    : Number.parseInt(String(env.jwt.accessTokenExpiresIn), 10) * 1000;
  
  const refreshTokenMaxAge = typeof env.jwt.refreshTokenExpiresIn === 'number' 
    ? env.jwt.refreshTokenExpiresIn * 1000
    : Number.parseInt(String(env.jwt.refreshTokenExpiresIn), 10) * 1000;

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: accessTokenMaxAge
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: refreshTokenMaxAge
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions);
};

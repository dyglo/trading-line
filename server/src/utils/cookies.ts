import type { Response } from "express";

import { ACCESS_TOKEN_COOKIE, COOKIE_PATH, REFRESH_TOKEN_COOKIE } from "../constants.js";
import { env } from "../env.js";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: (env.cookies.secure ? "none" : "lax") as "lax" | "none",
  secure: env.cookies.secure,
  domain: env.cookies.domain,
  path: COOKIE_PATH
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: env.jwt.accessTokenExpiresIn * 1000
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: env.jwt.refreshTokenExpiresIn * 1000
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions);
};

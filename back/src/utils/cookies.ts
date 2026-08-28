import type { Response } from "express";
import { env } from "../config/env.js";
import { tokenService } from "../services/tokenService.js";

export const REFRESH_COOKIE = "refreshToken";

/**
 * Writes the refresh token as an httpOnly cookie.
 *
 * `httpOnly` is the point: the access token can live in the page's memory, but
 * the credential that renews it must be unreadable to JavaScript, so an XSS
 * cannot walk away with a long-lived session. The old design put the whole
 * token in a `js-cookie` cookie, which any injected script could read.
 *
 * In production the API and the frontend are on different sites
 * (onrender.com / vercel.app), so the cookie has to be `SameSite=None`, which
 * browsers only accept together with `Secure`. Locally both are on localhost,
 * where `Lax` works and `Secure` would stop the cookie being set over http.
 */
const cookieOptions = () =>
  ({
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? ("none" as const) : ("lax" as const),
    path: "/api/auth",
  }) as const;

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions(),
    maxAge: tokenService.refreshCookieMaxAge(),
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
};

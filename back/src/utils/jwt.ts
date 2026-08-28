import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";
import type { AccessTokenPayload } from "../types/index.js";

/**
 * TODO(S6): tokens are still signed without `expiresIn` here so that sessions
 * already held by logged-in users keep working through this phase. Phase 2
 * introduces a 15-minute access token plus a rotating refresh token, at which
 * point `ACCESS_TOKEN_TTL` and `REFRESH_TOKEN_TTL` become live.
 *
 * TODO(S4): the payload deliberately still omits `role`. Adding it here without
 * the matching `adminMiddleware` would imply a guarantee that is not yet
 * enforced.
 */
export const signLegacyToken = (email: string): string =>
  jwt.sign({ email }, env.JWT_ACCESS_SECRET);

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (typeof decoded === "string" || !decoded.email) {
      throw ApiError.unauthorized("Invalid token");
    }

    return {
      sub: String(decoded.sub ?? decoded.email),
      email: String(decoded.email),
      role: decoded.role === "admin" ? "admin" : "user",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Session expired");
    }
    throw ApiError.unauthorized("Invalid token");
  }
};

/** Reads a bearer token from the Authorization header. */
export const extractBearerToken = (header?: string): string | null => {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
};

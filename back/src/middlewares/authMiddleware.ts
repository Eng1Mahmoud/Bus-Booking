import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { extractBearerToken, verifyAccessToken } from "../utils/jwt.js";

/**
 * Verifies the bearer token and attaches its claims to `req.user`.
 *
 * TODO(S4) — READ THIS BEFORE ADDING A ROUTE. This check proves only that a
 * token was signed by us. It does NOT distinguish a user from an admin, so
 * every `/admin/*` route it guards is reachable by any registered user.
 * Phase 2 adds `adminMiddleware` and puts a `role` claim in the token; until
 * then, do not treat this as authorization.
 */
export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(ApiError.unauthorized("No token provided"));
  }

  req.user = verifyAccessToken(token);
  next();
};

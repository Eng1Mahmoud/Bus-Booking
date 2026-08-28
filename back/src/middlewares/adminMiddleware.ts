import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

/**
 * Requires an admin role claim. Always mounted *after* `protect`, which is
 * what puts `req.user` there.
 *
 * This closes . Before it, every `/admin/*` route was guarded only by "is
 * this a token we signed", so any registered user could add and delete admins,
 * create and delete trips, list every user, and delete accounts.
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (req.user.role !== "admin") {
    return next(ApiError.forbidden("Admin access required"));
  }

  next();
};

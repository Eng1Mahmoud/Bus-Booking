import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Forwards a rejected promise to Express's error handler.
 *
 * Express 4 does not await route handlers, so a rejection inside an `async`
 * handler becomes an unhandled rejection and the request hangs until the client
 * times out. Every controller in this codebase is wrapped in this.
 */
export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

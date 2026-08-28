import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodTypeAny, z } from "zod";

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Parses request input against zod schemas before a controller runs.
 *
 * This is the fix for the whole class of injection this API was open to: every
 * handler read `req.body.x` and dropped it straight into a mongoose filter, so
 * a body of `{"email": {"$ne": null}}` was a valid query object. Parsing first
 * means a filter only ever receives a string where a string is declared.
 *
 * Results land on `req.validated` rather than overwriting `req.body`, so a
 * controller reading the validated value is doing so deliberately.
 */
export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
      };
      next();
    } catch (error) {
      // Surfaced by errorHandler as a 400 with per-field messages.
      next(error instanceof ZodError ? error : error);
    }
  };
};

/** Reusable: a 24-character hex Mongo ObjectId. */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

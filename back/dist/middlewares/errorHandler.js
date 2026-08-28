import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
/**
 * The single place an error becomes a response.
 *
 * Previously each controller wrote its own `.catch` — when it wrote one at all —
 * and several returned `error.message` straight to the client, leaking mongoose
 * and driver internals. Most had no catch, so the request simply hung.
 */
export const errorHandler = (error, req, res, 
// Express identifies error middleware by its four-parameter signature, so
// `next` must stay even though it is unused.
_next) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let details;
    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error instanceof ZodError) {
        statusCode = 400;
        message = "Validation failed";
        details = error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    }
    else if (error instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = "Validation failed";
        details = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
    }
    else if (error instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid value for ${error.path}`;
    }
    else if (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000) {
        statusCode = 409;
        message = "That value is already taken";
    }
    // 5xx means we broke something: log the whole error. 4xx is the client's
    // problem and is expected traffic, so keep it quiet.
    if (statusCode >= 500) {
        logger.error({ err: error, method: req.method, path: req.originalUrl }, "Unhandled error");
    }
    else {
        logger.debug({ method: req.method, path: req.originalUrl, statusCode, message }, "Request rejected");
    }
    const body = { message };
    if (details !== undefined)
        body.details = details;
    if (!env.isProduction && error instanceof Error && error.stack) {
        body.stack = error.stack;
    }
    res.status(statusCode).json(body);
};
//# sourceMappingURL=errorHandler.js.map
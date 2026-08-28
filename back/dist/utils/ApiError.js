/**
 * An error carrying the HTTP status the client should see.
 *
 * Anything thrown that is *not* an ApiError is treated by the error handler as
 * an unexpected fault: logged in full, reported to the client as a generic 500.
 * That split is what keeps stack traces and driver messages out of responses.
 */
export class ApiError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = "Bad request", details) {
        return new ApiError(400, message, details);
    }
    static unauthorized(message = "Not authorized") {
        return new ApiError(401, message);
    }
    static forbidden(message = "Forbidden") {
        return new ApiError(403, message);
    }
    static notFound(message = "Not found") {
        return new ApiError(404, message);
    }
    static conflict(message = "Conflict") {
        return new ApiError(409, message);
    }
    static tooMany(message = "Too many requests") {
        return new ApiError(429, message);
    }
    static internal(message = "Something went wrong") {
        return new ApiError(500, message);
    }
}
//# sourceMappingURL=ApiError.js.map
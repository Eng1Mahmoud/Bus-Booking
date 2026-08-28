/**
 * An error carrying the HTTP status the client should see.
 *
 * Anything thrown that is *not* an ApiError is treated by the error handler as
 * an unexpected fault: logged in full, reported to the client as a generic 500.
 * That split is what keeps stack traces and driver messages out of responses.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Not authorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict"): ApiError {
    return new ApiError(409, message);
  }

  static tooMany(message = "Too many requests"): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = "Something went wrong"): ApiError {
    return new ApiError(500, message);
  }
}

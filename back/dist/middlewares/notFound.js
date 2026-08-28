import { ApiError } from "../utils/ApiError.js";
/**
 * Turns an unmatched route into a 404 that flows through the error handler,
 * so unknown paths get the same JSON shape as every other error rather than
 * Express's default HTML page.
 */
export const notFound = (req, _res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
//# sourceMappingURL=notFound.js.map
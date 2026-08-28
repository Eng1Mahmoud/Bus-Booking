import { ApiError } from "../utils/ApiError.js";
import { extractBearerToken, verifyAccessToken } from "../utils/jwt.js";
/**
 * Verifies the bearer token and attaches its claims to `req.user`.
 *
 * This establishes *who* the caller is, not what they may do. A route that
 * needs an admin must also mount `requireAdmin`, which checks the `role`
 * claim; this middleware alone proves only that the token is ours.
 */
export const protect = (req, _res, next) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        return next(ApiError.unauthorized("No token provided"));
    }
    req.user = verifyAccessToken(token);
    next();
};
//# sourceMappingURL=authMiddleware.js.map
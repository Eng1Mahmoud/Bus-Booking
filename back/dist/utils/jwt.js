import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";
/**
 * Signs a short-lived access token.
 *
 * Two things changed from the original `jwt.sign({ email }, SECRET)`:
 * an expiry, so a leaked token stops working, and a `role` claim, so
 * `adminMiddleware` has something to check. Authorization now depends on this
 * claim, so it must only ever be set from a verified credential check.
 */
export const signAccessToken = (payload) => {
    const options = {
        subject: payload.subject,
        expiresIn: env.ACCESS_TOKEN_TTL,
    };
    return jwt.sign({ email: payload.email, role: payload.role }, env.JWT_ACCESS_SECRET, options);
};
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (typeof decoded === "string" || !decoded.email) {
            throw ApiError.unauthorized("Invalid token");
        }
        return {
            sub: String(decoded.sub ?? decoded.email),
            email: String(decoded.email),
            // Anything that is not exactly "admin" is a user. A token minted before
            // this phase carries no role claim and therefore cannot reach an admin
            // route — those sessions have to log in again, which is the point.
            role: decoded.role === "admin" ? "admin" : "user",
        };
    }
    catch (error) {
        if (error instanceof ApiError)
            throw error;
        if (error instanceof jwt.TokenExpiredError) {
            throw ApiError.unauthorized("Session expired");
        }
        throw ApiError.unauthorized("Invalid token");
    }
};
/** Reads a bearer token from the Authorization header. */
export const extractBearerToken = (header) => {
    if (!header?.startsWith("Bearer "))
        return null;
    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
};
//# sourceMappingURL=jwt.js.map
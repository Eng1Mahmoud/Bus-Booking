import cors from "cors";
import rateLimit, { type Options } from "express-rate-limit";
import { env } from "./env.js";

/**
 * CORS allowlist. Replaces the bare `app.use(cors())`, which reflected every
 * origin and so let any site on the internet make credentialed calls to this
 * API from a visitor's browser.
 *
 * Requests with no Origin header (curl, server-to-server, health checks) are
 * allowed through — CORS exists to constrain other sites' browser JavaScript,
 * and there is no origin to constrain in that case.
 */
export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    // Reply without CORS headers rather than erroring, so probing bots get a
    // clean rejection instead of turning into a stream of 500s.
    return callback(null, env.allowedOrigins.includes(origin));
  },
  credentials: true,
});

const baseLimiter: Partial<Options> = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
};

/** Blanket ceiling so no single client can saturate the API. */
export const globalLimiter = rateLimit({
  ...baseLimiter,
  windowMs: 15 * 60 * 1000,
  limit: 500,
  message: { message: "Too many requests. Please slow down." },
});

/** Slows credential stuffing against login. Successful logins are not counted. */
export const authLimiter = rateLimit({
  ...baseLimiter,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Please try again later." },
});

/**
 * Guards every endpoint that triggers an outbound email. Without this the
 * password-reset and signup endpoints are an unauthenticated relay that will
 * send mail from our Gmail account to any address on request.
 */
export const mailLimiter = rateLimit({
  ...baseLimiter,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: "Too many requests. Please wait before trying again." },
});

/** Booking and payment endpoints touch money and seat inventory. */
export const bookingLimiter = rateLimit({
  ...baseLimiter,
  windowMs: 5 * 60 * 1000,
  limit: 20,
  message: { message: "Too many booking attempts. Please wait a few minutes." },
});

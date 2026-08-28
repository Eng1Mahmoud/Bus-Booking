import pino from "pino";
import { env } from "../config/env.js";

/**
 * Structured logging. Replaces the scattered `console.log` calls — one of which
 * printed the full MONGO_URI, credentials included, on every boot.
 */
export const logger = pino({
  level: env.LOG_LEVEL ?? (env.isProduction ? "info" : "debug"),
  // Never let a credential reach the log stream, wherever it appears.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "password",
      "newPassword",
      "token",
      "refreshToken",
    ],
    censor: "[redacted]",
  },
  ...(env.isProduction || env.LOG_LEVEL === "silent"
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }),
});

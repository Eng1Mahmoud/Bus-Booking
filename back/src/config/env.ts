import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Every environment variable the API reads, validated once at boot.
 *
 * The previous implementation called `process.env.X` at nine different call
 * sites with no checks, so a missing MONGO_URI surfaced as an unhandled
 * mongoose rejection minutes into runtime, and a missing JWT_SECRET made
 * `jwt.sign` throw on the first login attempt. Failing here instead means a
 * misconfigured deploy never accepts traffic.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  /** Set to "silent" in tests so assertions are not buried in request logs. */
  LOG_LEVEL: z
    .enum(["silent", "fatal", "error", "warn", "info", "debug", "trace"])
    .optional(),

  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  // Comma-separated. Parsed into an array below.
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required")
    .refine((value) => value.startsWith("mongodb"), {
      message: "MONGO_URI must be a mongodb:// or mongodb+srv:// connection string",
    }),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  /**
   * Short by design. The client holds this in memory only and silently renews
   * it from the httpOnly refresh cookie, so a leaked access token is useful
   * for minutes rather than the forever it used to be.
   *
   * Phase 2 parked this at 7d because the frontend had no refresh loop yet.
   * Phase 6 added one, so it comes down.
   */
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  VERIFICATION_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(10),

  MAIL_SENDER: z.string().email().optional(),
  MAIL_PASSWORD: z.string().optional(),

  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_CURRENCY: z.string().length(3).default("USD"),
  EGP_TO_USD_RATE: z.coerce.number().positive().default(48),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.error(`\nInvalid environment configuration:\n${issues}\n`);
  console.error("See back/.env.example for the full list of variables.\n");
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
  allowedOrigins: raw.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Email can only be sent when both credentials are present. */
  mailEnabled: Boolean(raw.MAIL_SENDER && raw.MAIL_PASSWORD),
  /** PayPal calls can only be made when both credentials are present. */
  paypalEnabled: Boolean(raw.PAYPAL_CLIENT_ID && raw.PAYPAL_CLIENT_SECRET),
} as const;

export type Env = typeof env;

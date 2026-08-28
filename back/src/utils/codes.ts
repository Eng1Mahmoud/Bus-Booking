import crypto from "node:crypto";

/**
 * A 6-digit verification code.
 *
 * Six rather than the previous four: the code is now checked server-side with
 * a five-attempt cap, so length is the remaining defence against guessing, and
 * 10,000 possibilities was too few. `randomInt` is a CSPRNG; `Math.random`,
 * which the original used, is not.
 */
export const generateVerificationCode = (): string =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

/**
 * Codes are stored hashed so a leaked database does not hand over live reset
 * codes. SHA-256 rather than bcrypt is deliberate: the input is high-entropy
 * and short-lived, and this runs on every verification attempt.
 */
export const hashCode = (code: string): string =>
  crypto.createHash("sha256").update(code).digest("hex");

/** Constant-time comparison, so timing does not leak how much of a code matched. */
export const codeMatches = (code: string, expectedHash: string): boolean => {
  const actual = Buffer.from(hashCode(code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
};

/** An opaque refresh token. 384 bits — never guessable, never a JWT. */
export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("base64url");

export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

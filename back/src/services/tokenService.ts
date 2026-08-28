import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { signAccessToken } from "../utils/jwt.js";
import { generateRefreshToken, hashRefreshToken } from "../utils/codes.js";
import { env } from "../config/env.js";
import type { UserRole } from "../types/index.js";

/** Parses "30d" / "15m" / "3600" into milliseconds. */
const parseDuration = (value: string): number => {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration: ${value}`);

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return amount * (multipliers[unit] ?? 1000);
};

export interface Identity {
  subject: string;
  email: string;
  role: UserRole;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export const tokenService = {
  /** Mints an access/refresh pair and records the refresh token's hash. */
  async issue(identity: Identity): Promise<IssuedTokens> {
    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = new Date(
      Date.now() + parseDuration(env.REFRESH_TOKEN_TTL),
    );

    await RefreshToken.create({
      subject: identity.subject,
      email: identity.email,
      role: identity.role,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiresAt,
    });

    return {
      accessToken: signAccessToken(identity),
      refreshToken,
      refreshExpiresAt,
    };
  },

  /**
   * Exchanges a refresh token for a new pair, rotating the old one.
   *
   * Rotation means a token is single-use. If one is presented twice, the second
   * attempt is treated as a replay — someone is using a stolen copy — and every
   * session for that subject is revoked rather than just refusing the request.
   */
  async rotate(presentedToken: string): Promise<IssuedTokens> {
    const tokenHash = hashRefreshToken(presentedToken);
    const stored = await RefreshToken.findOne({ tokenHash }).exec();

    if (!stored) {
      throw ApiError.unauthorized("Invalid session");
    }

    if (stored.revokedAt) {
      logger.warn(
        { subject: stored.subject },
        "Reuse of a rotated refresh token — revoking all sessions for this account",
      );
      await this.revokeAllForSubject(stored.subject);
      throw ApiError.unauthorized("Session expired");
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw ApiError.unauthorized("Session expired");
    }

    const issued = await this.issue({
      subject: stored.subject,
      email: stored.email,
      role: stored.role,
    });

    stored.revokedAt = new Date();
    stored.replacedByHash = hashRefreshToken(issued.refreshToken);
    await stored.save();

    return issued;
  },

  /** Ends one session. Used by logout. */
  async revoke(presentedToken: string): Promise<void> {
    await RefreshToken.updateOne(
      { tokenHash: hashRefreshToken(presentedToken), revokedAt: null },
      { revokedAt: new Date() },
    ).exec();
  },

  /** Ends every session for an account — password change, or a detected replay. */
  async revokeAllForSubject(subject: string): Promise<void> {
    await RefreshToken.updateMany(
      { subject, revokedAt: null },
      { revokedAt: new Date() },
    ).exec();
  },

  refreshCookieMaxAge(): number {
    return parseDuration(env.REFRESH_TOKEN_TTL);
  },
};

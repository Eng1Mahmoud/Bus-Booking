import { Schema, model, type Document, type Model } from "mongoose";
import type { UserRole } from "../types/index.js";

/**
 * One row per issued refresh token.
 *
 * Storing a hash of every live token is what makes logout and revocation real:
 * a JWT on its own cannot be withdrawn once signed, which is why the previous
 * never-expiring tokens could not be taken back after a leak.
 */
export interface RefreshTokenDocument extends Document {
  subject: string;
  email: string;
  role: UserRole;
  /** SHA-256 of the token. A database dump does not yield usable tokens. */
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  /** Set when this token was rotated, pointing at its successor. */
  replacedByHash?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    subject: { type: String, required: true, index: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<RefreshTokenDocument> = model<RefreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema,
);

export default RefreshToken;

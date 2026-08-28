import { Schema, model, type Document, type Model } from "mongoose";

export type VerificationPurpose = "password_reset";

export interface VerificationTokenDocument extends Document {
  email: string;
  purpose: VerificationPurpose;
  /** SHA-256 of the code. The code itself only ever exists in the email. */
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  createdAt: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>(
  {
    email: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: ["password_reset"],
      required: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    // Capped by MAX_CODE_ATTEMPTS in authService. A 4-digit code is only 10,000
    // possibilities, so without this an attacker walks the whole space.
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// MongoDB drops the document once expiresAt passes, so used and abandoned codes
// clean themselves up rather than accumulating forever.
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationToken: Model<VerificationTokenDocument> =
  model<VerificationTokenDocument>("VerificationToken", verificationTokenSchema);

export default VerificationToken;

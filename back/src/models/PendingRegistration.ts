import { Schema, model, type Document, type Model } from "mongoose";

/**
 * A signup that has been started but whose email has not been proven yet.
 *
 * Holding it here rather than in `users` means an unverified signup cannot
 * squat somebody else's email address: the row expires, and the address stays
 * free for its real owner. It also preserves the existing behaviour, where a
 * user document only appears once verification succeeds.
 *
 * The password is already hashed on arrival — the plaintext is never stored,
 * and never leaves the server as it did when signup echoed the whole submitted
 * user object back to the browser.
 */
export interface PendingRegistrationDocument extends Document {
  FName: string;
  LName: string;
  email: string;
  passwordHash: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const pendingRegistrationSchema = new Schema<PendingRegistrationDocument>(
  {
    FName: { type: String, required: true, trim: true },
    LName: { type: String, required: true, trim: true },
    // One pending signup per address; a repeat signup replaces it.
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration: Model<PendingRegistrationDocument> =
  model<PendingRegistrationDocument>("PendingRegistration", pendingRegistrationSchema);

export default PendingRegistration;

import { Schema, model } from "mongoose";
const verificationTokenSchema = new Schema({
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
}, { timestamps: { createdAt: true, updatedAt: false } });
// MongoDB drops the document once expiresAt passes, so used and abandoned codes
// clean themselves up rather than accumulating forever.
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const VerificationToken = model("VerificationToken", verificationTokenSchema);
export default VerificationToken;
//# sourceMappingURL=VerificationToken.js.map
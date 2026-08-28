import { Schema, model } from "mongoose";
const pendingRegistrationSchema = new Schema({
    FName: { type: String, required: true, trim: true },
    LName: { type: String, required: true, trim: true },
    // One pending signup per address; a repeat signup replaces it.
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const PendingRegistration = model("PendingRegistration", pendingRegistrationSchema);
export default PendingRegistration;
//# sourceMappingURL=PendingRegistration.js.map
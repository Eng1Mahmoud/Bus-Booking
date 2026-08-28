import { Schema, model } from "mongoose";
const refreshTokenSchema = new Schema({
    subject: { type: String, required: true, index: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByHash: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
//# sourceMappingURL=RefreshToken.js.map
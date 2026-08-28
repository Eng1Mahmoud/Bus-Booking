import { Schema, model } from "mongoose";
const adminSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        // The original schema had no unique constraint, so `addAdmin`'s
        // find-then-insert check raced with itself and duplicates were possible.
        unique: true,
        trim: true,
        index: true,
    },
    // bcrypt-hashed, and `select: false` so it never leaves in a query result
    // unless a caller asks for it explicitly. A row still holding a pre-hash
    // value is upgraded on that admin's next successful login.
    password: { type: String, required: true, select: false },
}, { timestamps: true });
export const Admin = model("admins", adminSchema);
export default Admin;
//# sourceMappingURL=Admin.js.map
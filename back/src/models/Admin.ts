import { Schema, model, type Document, type Model } from "mongoose";

export interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminDocument>(
  {
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
    // TODO(S5): passwords in this collection are stored in PLAINTEXT — the old
    // login compared `admin.password !== password` directly. Phase 2 hashes
    // them with bcrypt and ships scripts/hashExistingAdmins.ts to migrate the
    // rows already in the database.
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export const Admin: Model<AdminDocument> = model<AdminDocument>("admins", adminSchema);

export default Admin;

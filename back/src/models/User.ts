import { Schema, model, type Document, type Model } from "mongoose";
import type { BookingHistoryEntry, UserRole } from "../types/index.js";

export interface UserDocument extends Document {
  FName: string;
  LName: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string;
  isVerified: boolean;
  bookingsHistory: BookingHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const bookingHistorySchema = new Schema<BookingHistoryEntry>(
  {
    date: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    seatPrice: { type: Number, required: true },
    busNumber: { type: Number, required: true },
    seatNumber: { type: Number, required: true },
    serialBook: { type: String },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument>(
  {
    FName: { type: String, required: true, trim: true },
    LName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    // `select: false` keeps the hash out of every query result unless a caller
    // explicitly asks for it. The old code returned the full document from
    // /getUser and /getAllUsers, hash included.
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      // Carried in the access token and enforced by `requireAdmin`.
    },
    image: { type: String },
    // Set once the emailed code has been matched against the hash held in
    // PendingRegistration; a user document is only created at that point.
    isVerified: { type: Boolean, default: false },
    bookingsHistory: { type: [bookingHistorySchema], default: [] },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> = model<UserDocument>("User", userSchema);

export default User;

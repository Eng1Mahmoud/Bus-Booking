import { Schema, model, type Document, type Model } from "mongoose";
import type { Bus, Seat } from "../types/index.js";

export interface TripDocument extends Document {
  from: string;
  to: string;
  /**
   * Stored as a `YYYY-M-D` string, matching the existing documents in Atlas.
   *
   * TODO(Phase 3): migrate to a real `Date`. As a string there is no range
   * query ("trips this week"), no timezone handling, and `2024-1-5` sorts
   * after `2024-10-5`.
   */
  date: string;
  bus: Bus[];
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<Seat>(
  {
    seatNumber: { type: Number, required: true },
    status: { type: Boolean, default: false },
    // Null on free seats and on sold seats; a timestamp only while a checkout
    // is in flight. `bookingService.releaseExpiredHolds` frees anything past it.
    heldUntil: { type: Date, default: null },
  },
  { _id: false },
);

const busSchema = new Schema<Bus>({
  number: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, min: 1 },
  seats: { type: [seatSchema], default: [] },
});

const tripSchema = new Schema<TripDocument>(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    bus: { type: [busSchema], default: [] },
  },
  { timestamps: true },
);

// Every search filters on exactly these three fields; without the index each
// one is a full collection scan.
tripSchema.index({ from: 1, to: 1, date: 1 });

export const Trip: Model<TripDocument> = model<TripDocument>("trips", tripSchema);

export default Trip;

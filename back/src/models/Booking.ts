import { Schema, model, type Document, type Model, type Types } from "mongoose";

export type BookingStatus = "pending" | "paid" | "cancelled" | "expired";

/**
 * A booking as a first-class record.
 *
 * Previously the only trace of a booking was an entry pushed onto the user
 * document — no id, no status, no link to a payment. There was nowhere to
 * record that money had actually changed hands, which is why nothing could
 * check it.
 */
export interface BookingDocument extends Document {
  /** Absent for counter sales, which have no customer account. */
  user?: Types.ObjectId;
  userEmail: string;
  /** How the ticket was sold. Counter sales bypass PayPal by design. */
  channel: "online" | "counter";

  trip: Types.ObjectId;
  from: string;
  to: string;
  date: string;
  busNumber: string;
  seatNumber: number;

  /** The seat price as stored on the trip, in EGP. Never sent by the client. */
  priceEGP: number;
  /** What PayPal was actually asked to charge. */
  amountCharged: number;
  currency: string;

  status: BookingStatus;
  /** Human-readable ticket reference, also used as the PayPal request id. */
  reference: string;

  paypalOrderId?: string;
  paypalCaptureId?: string;
  paidAt?: Date;

  /** While pending, the moment the seat hold lapses. Cleared once paid. */
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, required: true },
    channel: {
      type: String,
      enum: ["online", "counter"],
      default: "online",
      required: true,
    },

    trip: { type: Schema.Types.ObjectId, ref: "trips", required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String, required: true },
    busNumber: { type: String, required: true },
    seatNumber: { type: Number, required: true },

    priceEGP: { type: Number, required: true, min: 0 },
    amountCharged: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },

    paypalOrderId: { type: String, index: true, sparse: true },
    paypalCaptureId: { type: String },
    paidAt: { type: Date },

    expiresAt: { type: Date },
  },
  { timestamps: true },
);

// One paid booking per seat, per bus, per departure. The database refuses a
// double sale even if every check above it is somehow bypassed.
bookingSchema.index(
  { trip: 1, busNumber: 1, seatNumber: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } },
);

export const Booking: Model<BookingDocument> = model<BookingDocument>(
  "Booking",
  bookingSchema,
);

export default Booking;

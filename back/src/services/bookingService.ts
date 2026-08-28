import crypto from "node:crypto";
import { Trip, type TripDocument } from "../models/Trip.js";
import { Booking, type BookingDocument } from "../models/Booking.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { claimSeat, freeSeat, releaseLapsedHolds, sellSeat } from "./seatStore.js";
import type { SeatSelection } from "../validation/bookingSchemas.js";

/** How long a seat is held while the customer is in PayPal's checkout. */
export const HOLD_MINUTES = 10;

const reference = (): string =>
  `TZK-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

export const bookingService = {
  /**
   * Frees seats whose hold lapsed without a payment.
   *
   * Called before every hold attempt, so an abandoned checkout never takes a
   * seat off sale permanently. Booking rows are marked `expired` rather than
   * deleted, so an abandoned checkout stays auditable.
   */
  async releaseExpiredHolds(): Promise<void> {
    const now = new Date();

    await releaseLapsedHolds(now);
    await Booking.updateMany(
      { status: "pending", expiresAt: { $lt: now } },
      { status: "expired" },
    ).exec();
  },

  /** Locates the trip and the bus, and reads the authoritative seat price. */
  async resolveSeat({ from, to, date, busNumber, seatNumber }: SeatSelection) {
    const trip = await Trip.findOne({ from, to, date }).exec();
    if (!trip) throw ApiError.notFound("Trip not found");

    const bus = trip.bus.find((entry) => String(entry.number) === busNumber);
    if (!bus) throw ApiError.notFound("Bus not found on this trip");

    const seat = bus.seats.find((entry) => entry.seatNumber === seatNumber);
    if (!seat) throw ApiError.notFound("Seat not found on this bus");

    return { trip, bus, seat, price: bus.price };
  },

  /**
   * Claims a seat, atomically. Fixes S11.
   *
   * The atomicity lives in `seatStore.claimSeat`; see the note there on why
   * these writes bypass the mongoose model. Two concurrent callers both reach
   * it, MongoDB applies one, and the loser gets `false` and a 409. The original
   * set `status: true` unconditionally, so both were told they had the seat.
   */
  holdSeat: claimSeat,

  /** Puts a seat back on sale after a failed or abandoned checkout. */
  releaseSeat: freeSeat,

  /** Converts a hold into a sale: the seat stays taken, with no expiry. */
  confirmSeat: sellSeat,

  async createPending(params: {
    userId?: string;
    channel?: "online" | "counter";
    userEmail: string;
    trip: TripDocument;
    busNumber: string;
    seatNumber: number;
    priceEGP: number;
    amountCharged: number;
    currency: string;
    expiresAt: Date;
  }): Promise<BookingDocument> {
    return Booking.create({
      user: params.userId,
      channel: params.channel ?? "online",
      userEmail: params.userEmail,
      trip: params.trip._id,
      from: params.trip.from,
      to: params.trip.to,
      date: params.trip.date,
      busNumber: params.busNumber,
      seatNumber: params.seatNumber,
      priceEGP: params.priceEGP,
      amountCharged: params.amountCharged,
      currency: params.currency,
      status: "pending",
      reference: reference(),
      expiresAt: params.expiresAt,
    });
  },

  /**
   * Mirrors a paid booking onto the user document.
   *
   * `bookingsHistory` is what the settings page renders, so it is kept in step.
   * The Booking collection is the record of truth; this is a denormalised copy
   * and a failure here must not undo a captured payment, hence the log rather
   * than a throw.
   */
  async appendToHistory(booking: BookingDocument): Promise<void> {
    // Counter sales have no account to mirror onto.
    if (!booking.user) return;

    try {
      await User.updateOne(
        { _id: booking.user },
        {
          $push: {
            bookingsHistory: {
              from: booking.from,
              to: booking.to,
              date: booking.date,
              busNumber: Number(booking.busNumber),
              seatNumber: booking.seatNumber,
              seatPrice: booking.priceEGP,
              serialBook: booking.reference,
            },
          },
        },
      ).exec();
    } catch (error) {
      logger.error(
        { err: error, reference: booking.reference },
        "Paid booking could not be mirrored onto the user document",
      );
    }
  },

  async listForUser(userId: string): Promise<BookingDocument[]> {
    return Booking.find({ user: userId, status: "paid" })
      .sort({ createdAt: -1 })
      .lean<BookingDocument[]>()
      .exec();
  },
};

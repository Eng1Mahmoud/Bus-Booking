import { Trip } from "../models/Trip.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import type { CreateBookingInput } from "../validation/bookingSchemas.js";

export const bookingService = {
  /**
   * Reserves a seat and appends it to the caller's booking history.
   *
   * TODO(S3) — no payment is verified and `seatePrice` is whatever the client
   * sent. Phase 3 rebuilds this around a captured PayPal order.
   *
   * TODO(S11) — the seat filter still does not assert `status: false`, so two
   * concurrent requests can both claim the same seat. Fixing it properly means
   * returning a 409 to the loser, which the current frontend has no handling
   * for; it lands in Phase 3 alongside the payment rewrite.
   *
   * What *is* fixed here: the original responded to the client before writing
   * the booking history, then called `res.status(500)` from that write's error
   * path — on an already-sent response, crashing the process with
   * ERR_HTTP_HEADERS_SENT. Both writes are now awaited before responding.
   */
  async create(email: string, input: CreateBookingInput) {
    const { from, to, date, busNumber, seatNumber, seatePrice } = input;

    const result = await Trip.updateOne(
      {
        from,
        to,
        date,
        "bus.number": busNumber,
        "bus.seats": { $elemMatch: { seatNumber } },
      },
      { $set: { "bus.$[bus].seats.$[seat].status": true } },
      {
        arrayFilters: [{ "bus.number": busNumber }, { "seat.seatNumber": seatNumber }],
      },
    ).exec();

    if (result.matchedCount === 0) {
      throw ApiError.notFound("Trip or seat not found");
    }

    const historyUpdate = await User.updateOne(
      { email },
      {
        $push: {
          bookingsHistory: {
            from,
            to,
            date,
            busNumber: Number(busNumber),
            seatNumber,
            seatPrice: seatePrice,
          },
        },
      },
    ).exec();

    if (historyUpdate.matchedCount === 0) {
      // The seat is taken but no history row was written. Surfaced loudly
      // because it leaves the two collections inconsistent — Phase 3's
      // Booking model removes this split entirely.
      logger.error({ email }, "Seat reserved but user not found for history");
    }

    return { message: "Booked successfully", result } as const;
  },
};

import { bookingService } from "./bookingService.js";
import { ApiError } from "../utils/ApiError.js";
import type { SeatSelection } from "../validation/bookingSchemas.js";

/**
 * Counter sales — a ticket sold at a station, paid for offline.
 *
 * Kept apart from `paymentService` on purpose: this is the only route that can
 * mark a seat sold without a captured PayPal payment, so it should be obvious
 * in the file tree, and it is admin-only. The price is still read from the trip
 * document; an admin cannot name a fare either.
 */
export const adminBookingService = {
  async bookAtCounter(adminEmail: string, selection: SeatSelection) {
    await bookingService.releaseExpiredHolds();

    const { trip, seat, price } = await bookingService.resolveSeat(selection);

    if (seat.status) {
      throw ApiError.conflict("That seat is no longer available");
    }

    const claimed = await bookingService.holdSeat(
      trip.id as string,
      selection.busNumber,
      selection.seatNumber,
      new Date(Date.now() + 60_000),
    );

    if (!claimed) {
      throw ApiError.conflict("That seat was just taken");
    }

    const booking = await bookingService.createPending({
      channel: "counter",
      userEmail: adminEmail,
      trip,
      busNumber: selection.busNumber,
      seatNumber: selection.seatNumber,
      priceEGP: price,
      amountCharged: price,
      currency: "EGP",
      expiresAt: new Date(Date.now() + 60_000),
    });

    booking.status = "paid";
    booking.paidAt = new Date();
    booking.expiresAt = undefined;
    await booking.save();

    await bookingService.confirmSeat(
      trip.id as string,
      selection.busNumber,
      selection.seatNumber,
    );

    return {
      message: "Booked successfully",
      reference: booking.reference,
      priceEGP: price,
    } as const;
  },
};

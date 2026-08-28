import { bookingService } from "../services/bookingService.js";
import { adminBookingService } from "../services/adminBookingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import type { SeatSelection } from "../validation/bookingSchemas.js";

export const bookingController = {
  /** The caller's own paid bookings. */
  mine: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const bookings = await bookingService.listForUser(req.user.sub);
    res.status(200).json({ message: "Bookings retrieved", bookings });
  }),

  /**
   * Counter sale: an admin books a seat without an online payment.
   *
   * This is the one path that can mark a seat sold without PayPal, which is why
   * it is admin-only. The price still comes from the trip document, never from
   * the request.
   */
  createByAdmin: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await adminBookingService.bookAtCounter(
      req.user.email,
      req.validated?.body as SeatSelection,
    );
    res.status(201).json(result);
  }),
};

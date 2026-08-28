import { bookingService } from "../services/bookingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateBookingInput } from "../validation/bookingSchemas.js";

export const bookingController = {
  create: asyncHandler(async (req, res) => {
    const email = req.user?.email;
    if (!email) throw ApiError.unauthorized();

    const result = await bookingService.create(
      email,
      req.validated?.body as CreateBookingInput,
    );
    res.status(200).json(result);
  }),
};

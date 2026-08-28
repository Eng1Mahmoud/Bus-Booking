import { Router } from "express";
import { bookingController } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { bookingLimiter } from "../config/security.js";
import { createBookingSchema } from "../validation/bookingSchemas.js";

const router = Router();

router.post(
  "/",
  bookingLimiter,
  protect,
  validate({ body: createBookingSchema }),
  bookingController.create,
);

export default router;

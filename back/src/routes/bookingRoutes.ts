import { Router } from "express";
import { bookingController } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

/**
 * There is deliberately no `POST /api/bookings`.
 *
 * A booking is now created only as the side effect of a captured payment
 * (`POST /api/payments/orders/:orderId/capture`) or of an admin counter sale
 * (`POST /api/admin/bookings`). An endpoint that mints a booking on request is
 * exactly what made free tickets possible.
 */
router.get("/", bookingController.mine);

export default router;

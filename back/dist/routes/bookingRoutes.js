import { Router } from "express";
import { bookingController } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();
router.use(protect);
/**
 * There is deliberately no `POST /api/bookings`.
 *
 * A booking is created only as the side effect of a captured payment
 * (`POST /api/payments/orders/:orderId/capture`) or of an admin counter sale
 * (`POST /api/admin/bookings`), so a seat is never marked sold without either
 * a verified payment or a deliberate admin action.
 */
router.get("/", bookingController.mine);
export default router;
//# sourceMappingURL=bookingRoutes.js.map
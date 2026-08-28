import { Router } from "express";
import { paymentController } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { bookingLimiter } from "../config/security.js";
import { paypalOrderIdSchema, seatSelectionSchema, } from "../validation/bookingSchemas.js";
const router = Router();
router.use(protect, bookingLimiter);
/**
 * Two-step checkout.
 *
 * The client identifies a seat; the server decides the price, holds the seat
 * and creates the PayPal order. Nothing the browser sends can influence the
 * amount, and no booking becomes `paid` until this server has itself captured
 * the payment and matched the captured sum against the order.
 */
router.post("/orders", validate({ body: seatSelectionSchema }), paymentController.createOrder);
router.post("/orders/:orderId/capture", validate({ params: paypalOrderIdSchema }), paymentController.captureOrder);
router.post("/orders/:orderId/cancel", validate({ params: paypalOrderIdSchema }), paymentController.cancelOrder);
export default router;
//# sourceMappingURL=paymentRoutes.js.map
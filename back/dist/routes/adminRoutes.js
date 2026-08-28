import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { tripController } from "../controllers/tripController.js";
import { bookingController } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../config/security.js";
import { emailParamSchema } from "../validation/userSchemas.js";
import { seatSelectionSchema } from "../validation/bookingSchemas.js";
import { addAdminSchema, addTripSchema, adminLoginSchema, deleteTripParamsSchema, } from "../validation/adminSchemas.js";
const router = Router();
router.post("/login", authLimiter, validate({ body: adminLoginSchema }), adminController.login);
/**
 * `protect` establishes *who* the caller is; `requireAdmin` decides
 * whether they may be here. Until this phase only the first of those ran, so
 * every route below was reachable with any registered user's token.
 */
router.use(protect, requireAdmin);
router.get("/admins", adminController.listAdmins);
router.post("/admins", validate({ body: addAdminSchema }), adminController.addAdmin);
router.delete("/admins/:email", validate({ params: emailParamSchema }), adminController.deleteAdmin);
router.get("/trips", tripController.listAll);
router.post("/trips", validate({ body: addTripSchema }), adminController.addTrip);
router.delete("/trips/:from/:to/:date/:busNumber", validate({ params: deleteTripParamsSchema }), adminController.deleteTripBus);
/** Counter sale — the only way to a paid seat without PayPal. */
router.post("/bookings", validate({ body: seatSelectionSchema }), bookingController.createByAdmin);
export default router;
//# sourceMappingURL=adminRoutes.js.map
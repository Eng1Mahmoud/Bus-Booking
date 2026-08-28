import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { userController } from "../controllers/userController.js";
import { tripController } from "../controllers/tripController.js";
import { bookingController } from "../controllers/bookingController.js";
import { adminController } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter, bookingLimiter, mailLimiter } from "../config/security.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema, } from "../validation/authSchemas.js";
import { changePasswordSchema, emailParamSchema, listUsersQuerySchema, updateProfileSchema, uploadAvatarSchema, } from "../validation/userSchemas.js";
import { searchTripsSchema } from "../validation/tripSchemas.js";
import { seatSelectionSchema } from "../validation/bookingSchemas.js";
import { addAdminSchema, addTripSchema, adminLoginSchema, deleteTripParamsSchema, } from "../validation/adminSchemas.js";
/**
 * DEPRECATED path aliases.
 *
 * The deployed frontend at bus-booking.vercel.app calls these twelve paths with
 * this exact casing (`/SignUp`, `/AddTrip`) and these HTTP verbs (`POST` for
 * reads). They are mounted at the server root, alongside the real `/api`
 * routes, so this phase can restructure the backend without shipping a
 * frontend release on the same day.
 *
 * Every route here delegates to the same controller as its `/api` counterpart —
 * there is no duplicated logic, only a second URL.
 *
 * Removal plan: Phase 5 repoints the frontend at `/api/*`. Once the old
 * frontend build is no longer served, delete this file and its mount in
 * app.ts. Nothing else references it.
 */
const router = Router();
// --- Auth ------------------------------------------------------------------
router.post("/SignUp", mailLimiter, validate({ body: registerSchema }), authController.register);
router.post("/verification", authLimiter, validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
router.post("/sendCodeVerification", mailLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post("/newPassword", authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
// --- Users -----------------------------------------------------------------
router.post("/getUser", protect, userController.me);
router.post("/updateInfo", protect, validate({ body: updateProfileSchema }), userController.updateProfile);
router.post("/changePassword", protect, validate({ body: changePasswordSchema }), userController.changePassword);
router.post("/uploadImage", protect, validate({ body: uploadAvatarSchema }), userController.updateAvatar);
router.get("/getAllUsers", protect, requireAdmin, validate({ query: listUsersQuerySchema }), userController.listAll);
router.delete("/deleteUser/:email", protect, requireAdmin, validate({ params: emailParamSchema }), userController.remove);
// --- Trips & bookings ------------------------------------------------------
router.post("/search", validate({ body: searchTripsSchema }), tripController.search);
/**
 * RETIRED, and not replaceable in place.
 *
 * It accepted `seatePrice` from the browser and marked a seat sold without ever
 * contacting PayPal, so anyone with a login could book any seat at any price —
 * or none. There is no backward-compatible way to keep it: the flaw *is* the
 * contract. Callers must use POST /api/payments/orders, then capture.
 *
 * 410 rather than 404 so an old cached bundle produces a message a user can
 * act on ("refresh the page") instead of a silent failure.
 */
router.post("/book", (_req, res) => {
    res.status(410).json({
        message: "This booking endpoint has been retired. Please refresh the page to load the latest version of the app.",
        replacedBy: "POST /api/payments/orders",
    });
});
// --- Admin -----------------------------------------------------------------
router.post("/admin/login", authLimiter, validate({ body: adminLoginSchema }), adminController.login);
router.get("/admin/getAdmins", protect, requireAdmin, adminController.listAdmins);
router.post("/admin/addAdmin", protect, requireAdmin, validate({ body: addAdminSchema }), adminController.addAdmin);
router.delete("/admin/deleteAdmin/:email", protect, requireAdmin, validate({ params: emailParamSchema }), adminController.deleteAdmin);
router.get("/admin/getTrips", protect, requireAdmin, tripController.listAll);
router.post("/admin/AddTrip", protect, requireAdmin, validate({ body: addTripSchema }), adminController.addTrip);
router.delete("/admin/deleteTrip/:from/:to/:date/:busNumber", protect, requireAdmin, validate({ params: deleteTripParamsSchema }), adminController.deleteTripBus);
// Counter sale. Same handler as POST /api/admin/bookings; the price is read
// from the trip, not from the request.
router.post("/admin/book", bookingLimiter, protect, requireAdmin, validate({ body: seatSelectionSchema }), bookingController.createByAdmin);
export default router;
//# sourceMappingURL=legacyRoutes.js.map
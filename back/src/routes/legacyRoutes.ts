import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { userController } from "../controllers/userController.js";
import { tripController } from "../controllers/tripController.js";
import { bookingController } from "../controllers/bookingController.js";
import { adminController } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter, bookingLimiter, mailLimiter } from "../config/security.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validation/authSchemas.js";
import {
  changePasswordSchema,
  emailParamSchema,
  updateProfileSchema,
  uploadAvatarSchema,
} from "../validation/userSchemas.js";
import { searchTripsSchema } from "../validation/tripSchemas.js";
import { createBookingSchema } from "../validation/bookingSchemas.js";
import {
  addAdminSchema,
  addTripSchema,
  adminLoginSchema,
  deleteTripParamsSchema,
} from "../validation/adminSchemas.js";

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
router.post(
  "/SignUp",
  mailLimiter,
  validate({ body: registerSchema }),
  authController.register,
);
router.post(
  "/verification",
  authLimiter,
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail,
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  authController.login,
);
router.post(
  "/sendCodeVerification",
  mailLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
router.post(
  "/newPassword",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

// --- Users -----------------------------------------------------------------
router.post("/getUser", protect, userController.me);
router.post(
  "/updateInfo",
  protect,
  validate({ body: updateProfileSchema }),
  userController.updateProfile,
);
router.post(
  "/changePassword",
  protect,
  validate({ body: changePasswordSchema }),
  userController.changePassword,
);
router.post(
  "/uploadImage",
  protect,
  validate({ body: uploadAvatarSchema }),
  userController.updateAvatar,
);
router.get("/getAllUsers", protect, userController.listAll);
router.delete(
  "/deleteUser/:email",
  protect,
  validate({ params: emailParamSchema }),
  userController.remove,
);

// --- Trips & bookings ------------------------------------------------------
router.post("/search", validate({ body: searchTripsSchema }), tripController.search);
router.post(
  "/book",
  bookingLimiter,
  protect,
  validate({ body: createBookingSchema }),
  bookingController.create,
);

// --- Admin -----------------------------------------------------------------
router.post(
  "/admin/login",
  authLimiter,
  validate({ body: adminLoginSchema }),
  adminController.login,
);
router.get("/admin/getAdmins", protect, adminController.listAdmins);
router.post(
  "/admin/addAdmin",
  protect,
  validate({ body: addAdminSchema }),
  adminController.addAdmin,
);
router.delete(
  "/admin/deleteAdmin/:email",
  protect,
  validate({ params: emailParamSchema }),
  adminController.deleteAdmin,
);
router.get("/admin/getTrips", protect, tripController.listAll);
router.post(
  "/admin/AddTrip",
  protect,
  validate({ body: addTripSchema }),
  adminController.addTrip,
);
router.delete(
  "/admin/deleteTrip/:from/:to/:date/:busNumber",
  protect,
  validate({ params: deleteTripParamsSchema }),
  adminController.deleteTripBus,
);
router.post(
  "/admin/book",
  bookingLimiter,
  protect,
  validate({ body: createBookingSchema }),
  bookingController.create,
);

export default router;

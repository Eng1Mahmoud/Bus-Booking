import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter, mailLimiter } from "../config/security.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validation/authSchemas.js";

const router = Router();

// Both of these send email, so they carry the tighter mail limit.
router.post(
  "/register",
  mailLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

router.post(
  "/forgot-password",
  mailLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

router.post(
  "/verify-email",
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
  "/reset-password",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

/**
 * Session lifecycle. The refresh cookie is scoped to /api/auth, so it is only
 * ever sent to these two endpoints and never rides along on ordinary API calls.
 */
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;

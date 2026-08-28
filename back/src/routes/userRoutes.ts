import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  changePasswordSchema,
  emailParamSchema,
  listUsersQuerySchema,
  updateProfileSchema,
  uploadAvatarSchema,
} from "../validation/userSchemas.js";

const router = Router();

// Everything below requires a valid token.
router.use(protect);

// --- The caller's own account ----------------------------------------------
router.get("/me", userController.me);

router.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  userController.updateProfile,
);

router.patch(
  "/me/password",
  validate({ body: changePasswordSchema }),
  userController.changePassword,
);

router.put(
  "/me/avatar",
  validate({ body: uploadAvatarSchema }),
  userController.updateAvatar,
);

// --- Administrative ---------------------------------------------------------
// Listing and deleting accounts is now admin-only; previously any
// authenticated caller could enumerate every user and delete any of them.
router.get(
  "/",
  requireAdmin,
  validate({ query: listUsersQuerySchema }),
  userController.listAll,
);

router.delete(
  "/:email",
  requireAdmin,
  validate({ params: emailParamSchema }),
  userController.remove,
);

export default router;

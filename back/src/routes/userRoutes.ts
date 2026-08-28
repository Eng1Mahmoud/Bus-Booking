import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  changePasswordSchema,
  emailParamSchema,
  updateProfileSchema,
  uploadAvatarSchema,
} from "../validation/userSchemas.js";

const router = Router();

// Everything below requires a valid token.
router.use(protect);

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

// TODO(S4/S7): these two are administrative and must move behind
// `adminMiddleware` in Phase 2. `protect` alone does not authorize them.
router.get("/", userController.listAll);
router.delete("/:email", validate({ params: emailParamSchema }), userController.remove);

export default router;

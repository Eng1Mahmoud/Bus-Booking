import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { tripController } from "../controllers/tripController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../config/security.js";
import { emailParamSchema } from "../validation/userSchemas.js";
import {
  addAdminSchema,
  addTripSchema,
  adminLoginSchema,
  deleteTripParamsSchema,
} from "../validation/adminSchemas.js";

const router = Router();

router.post(
  "/login",
  authLimiter,
  validate({ body: adminLoginSchema }),
  adminController.login,
);

/**
 * TODO(S4) — CRITICAL. `protect` verifies a signature and nothing more, so
 * every route below is reachable with any registered user's token. Phase 2
 * inserts `requireRole("admin")` here; this comment is the only thing standing
 * between the current state and someone assuming these are protected.
 */
router.use(protect);

router.get("/admins", adminController.listAdmins);
router.post("/admins", validate({ body: addAdminSchema }), adminController.addAdmin);
router.delete(
  "/admins/:email",
  validate({ params: emailParamSchema }),
  adminController.deleteAdmin,
);

router.get("/trips", tripController.listAll);
router.post("/trips", validate({ body: addTripSchema }), adminController.addTrip);
router.delete(
  "/trips/:from/:to/:date/:busNumber",
  validate({ params: deleteTripParamsSchema }),
  adminController.deleteTripBus,
);

export default router;

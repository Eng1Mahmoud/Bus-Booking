import { Router } from "express";
import { tripController } from "../controllers/tripController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { searchTripsSchema } from "../validation/tripSchemas.js";
const router = Router();
/**
 * Search stays a POST in this phase because MuiForm.jsx posts a JSON body to
 * it. Phase 5 moves the client to `GET /api/trips/search?from=&to=&date=`,
 * which is cacheable and linkable.
 */
router.post("/search", validate({ body: searchTripsSchema }), tripController.search);
router.get("/", protect, tripController.listAll);
export default router;
//# sourceMappingURL=tripRoutes.js.map
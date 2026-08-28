import { tripService } from "../services/tripService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
/**
 * Controllers do three things: read validated input, call a service, shape the
 * response. No database access, no business rules.
 */
export const tripController = {
    search: asyncHandler(async (req, res) => {
        const input = req.validated?.body;
        const trips = await tripService.search(input);
        // The current frontend reads `res.data` as a bare array (MuiForm.jsx:89),
        // so the legacy shape is preserved here. Phase 5 moves the client to the
        // `{ trips }` envelope used by every other new endpoint.
        res.status(200).json(trips);
    }),
    listAll: asyncHandler(async (_req, res) => {
        const trips = await tripService.listAll();
        res.status(200).json(trips);
    }),
};
//# sourceMappingURL=tripController.js.map
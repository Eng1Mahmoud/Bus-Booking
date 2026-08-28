import { adminService } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setRefreshCookie } from "../utils/cookies.js";
export const adminController = {
    login: asyncHandler(async (req, res) => {
        const result = await adminService.login(req.validated?.body);
        if (!result.exist) {
            return res.status(200).json(result);
        }
        setRefreshCookie(res, result.tokens.refreshToken);
        res.status(200).json({
            exist: true,
            message: result.message,
            token: result.tokens.accessToken,
        });
    }),
    listAdmins: asyncHandler(async (_req, res) => {
        res.status(200).json(await adminService.listAdmins());
    }),
    addAdmin: asyncHandler(async (req, res) => {
        const result = await adminService.addAdmin(req.validated?.body);
        res.status(200).json(result);
    }),
    deleteAdmin: asyncHandler(async (req, res) => {
        const { email } = req.validated?.params;
        res.status(200).json(await adminService.deleteAdmin(email));
    }),
    addTrip: asyncHandler(async (req, res) => {
        const result = await adminService.addTrip(req.validated?.body);
        res.status(200).json(result);
    }),
    deleteTripBus: asyncHandler(async (req, res) => {
        const params = req.validated?.params;
        res.status(200).json(await adminService.deleteTripBus(params));
    }),
};
//# sourceMappingURL=adminController.js.map
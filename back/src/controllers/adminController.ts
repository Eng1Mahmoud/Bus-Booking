import { adminService } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  AddAdminInput,
  AddTripInput,
  AdminLoginInput,
  DeleteTripParams,
} from "../validation/adminSchemas.js";

export const adminController = {
  login: asyncHandler(async (req, res) => {
    const result = await adminService.login(req.validated?.body as AdminLoginInput);
    res.status(200).json(result);
  }),

  listAdmins: asyncHandler(async (_req, res) => {
    res.status(200).json(await adminService.listAdmins());
  }),

  addAdmin: asyncHandler(async (req, res) => {
    const result = await adminService.addAdmin(req.validated?.body as AddAdminInput);
    res.status(200).json(result);
  }),

  deleteAdmin: asyncHandler(async (req, res) => {
    const { email } = req.validated?.params as { email: string };
    res.status(200).json(await adminService.deleteAdmin(email));
  }),

  addTrip: asyncHandler(async (req, res) => {
    const result = await adminService.addTrip(req.validated?.body as AddTripInput);
    res.status(200).json(result);
  }),

  deleteTripBus: asyncHandler(async (req, res) => {
    const params = req.validated?.params as DeleteTripParams;
    res.status(200).json(await adminService.deleteTripBus(params));
  }),
};

import { userService } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  ChangePasswordInput,
  ListUsersQuery,
  UpdateProfileInput,
  UploadAvatarInput,
} from "../validation/userSchemas.js";
import type { Request } from "express";

/** The authenticated caller's email, or a 401. Never read from the body. */
const callerEmail = (req: Request): string => {
  const email = req.user?.email;
  if (!email) throw ApiError.unauthorized();
  return email;
};

export const userController = {
  me: asyncHandler(async (req, res) => {
    const result = await userService.getByEmail(callerEmail(req));
    res.status(200).json({ message: "User found", result });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const result = await userService.updateProfile(
      callerEmail(req),
      req.validated?.body as UpdateProfileInput,
    );
    res.status(200).json({ message: "User updated", result });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await userService.changePassword(
      callerEmail(req),
      req.validated?.body as ChangePasswordInput,
    );
    // Nested under `result` because ChangePassword.jsx reads
    // `res.data.result.match`.
    res.status(200).json({ result });
  }),

  updateAvatar: asyncHandler(async (req, res) => {
    const result = await userService.updateAvatar(
      callerEmail(req),
      req.validated?.body as UploadAvatarInput,
    );
    res.status(200).json({ message: "Image uploaded", result });
  }),

  listAll: asyncHandler(async (req, res) => {
    const { users, ...pagination } = await userService.listAll(
      req.validated?.query as ListUsersQuery,
    );
    // `result` stays the array so the existing admin frontend keeps working;
    // pagination is added alongside it.
    res.status(200).json({ message: "All users", result: users, pagination });
  }),

  remove: asyncHandler(async (req, res) => {
    const { email } = req.validated?.params as { email: string };
    await userService.deleteByEmail(email);
    res.status(200).json({ message: "User deleted" });
  }),
};

import { authService } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validation/authSchemas.js";

/**
 * Response shapes are byte-for-byte what the deployed frontend already reads
 * (`res.data.exist`, `res.data.verification`, ...). They are deliberately not
 * normalised in this phase — Phase 5 moves the client onto the new envelope
 * and the old shapes go with it.
 */
export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.validated?.body as RegisterInput);
    res.status(200).json(result);
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(
      req.validated?.body as VerifyEmailInput,
    );
    res.status(result.verification ? 201 : 200).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.validated?.body as LoginInput);
    res.status(200).json(result);
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(
      req.validated?.body as ForgotPasswordInput,
    );
    res.status(200).json(result);
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(
      req.validated?.body as ResetPasswordInput,
    );
    res.status(200).json(result);
  }),
};

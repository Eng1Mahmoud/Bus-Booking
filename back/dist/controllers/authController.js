import { authService } from "../services/authService.js";
import { tokenService } from "../services/tokenService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie, } from "../utils/cookies.js";
/**
 * `token` is still returned in the body because the deployed frontend reads
 * `res.data.token` and sends it as a bearer header. The refresh token goes out
 * as an httpOnly cookie in the same response, so Phase 6 can switch the client
 * to silent refresh without another backend change.
 */
export const authController = {
    register: asyncHandler(async (req, res) => {
        const result = await authService.register(req.validated?.body);
        res.status(200).json(result);
    }),
    verifyEmail: asyncHandler(async (req, res) => {
        const result = await authService.verifyEmail(req.validated?.body);
        res.status(result.verification ? 201 : 200).json(result);
    }),
    login: asyncHandler(async (req, res) => {
        const result = await authService.login(req.validated?.body);
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
    /** Exchanges the refresh cookie for a new access token. Used from Phase 6. */
    refresh: asyncHandler(async (req, res) => {
        const presented = req.cookies?.[REFRESH_COOKIE];
        if (!presented) {
            throw ApiError.unauthorized("No session");
        }
        const tokens = await tokenService.rotate(presented);
        setRefreshCookie(res, tokens.refreshToken);
        res.status(200).json({ token: tokens.accessToken });
    }),
    logout: asyncHandler(async (req, res) => {
        const presented = req.cookies?.[REFRESH_COOKIE];
        if (presented) {
            await tokenService.revoke(presented);
        }
        clearRefreshCookie(res);
        // Always 200: logging out of a session that is already gone is a success.
        res.status(200).json({ message: "Logged out" });
    }),
    forgotPassword: asyncHandler(async (req, res) => {
        const result = await authService.forgotPassword(req.validated?.body);
        res.status(200).json(result);
    }),
    resetPassword: asyncHandler(async (req, res) => {
        const result = await authService.resetPassword(req.validated?.body);
        res.status(200).json(result);
    }),
};
//# sourceMappingURL=authController.js.map
import { api } from "@/api/client";
import { clearAccessToken, setAccessToken } from "@/api/tokenStore";
import type {
  ForgotPasswordResponse,
  LoginResponse,
  RegisterResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
} from "@/types/apiResponses";

/**
 * One function per endpoint, mirroring the portfolio's `actions/` convention.
 *
 * These call `/api/auth/*`, not the deprecated aliases (`/login`, `/SignUp`)
 * the components used to hardcode. That is what lets `legacyRoutes.ts` be
 * deleted from the API, and what lets the dev server proxy `/api` to :5000 so
 * development is same-origin.
 */
export interface Credentials {
  email: string;
  password: string;
}

export interface RegistrationDetails extends Credentials {
  FName: string;
  LName: string;
}

export const authService = {
  async login(credentials: Credentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/api/auth/login", credentials);
    // The refresh cookie rides along on the same response; only the short-lived
    // access token needs holding onto.
    if (data.exist && data.token) {
      setAccessToken(data.token);
    }
    return data;
  },

  async register(details: RegistrationDetails): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/api/auth/register", details);
    return data;
  },

  async verifyEmail(input: {
    verificationCode: string;
    email: string;
  }): Promise<VerifyEmailResponse> {
    const { data } = await api.post<VerifyEmailResponse>("/api/auth/verify-email", {
      verificationCode: input.verificationCode,
      user: { email: input.email },
    });
    return data;
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const { data } = await api.post<ForgotPasswordResponse>(
      "/api/auth/forgot-password",
      { email },
    );
    return data;
  },

  async resetPassword(input: {
    email: string;
    password: string;
    verificationCode: string;
  }): Promise<ResetPasswordResponse> {
    const { data } = await api.post<ResetPasswordResponse>(
      "/api/auth/reset-password",
      input,
    );
    return data;
  },

  /** Revokes the refresh token server-side, then drops the in-memory one. */
  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } finally {
      clearAccessToken();
    }
  },
};

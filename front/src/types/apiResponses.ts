import type { Trip, UserProfile } from "./index";

/**
 * Response shapes as the API returns them today.
 *
 * Several are awkward — `{ exist, message }` instead of a status code,
 * `{ result }` instead of the resource — because they are the legacy contract
 * the deployed frontend was built against. They are typed here rather than
 * smoothed over so the mismatch is visible at every call site, and so the
 * eventual switch to the `/api` envelope is a compile error, not a silent break.
 */
export interface LoginResponse {
  exist: boolean;
  message: string;
  token?: string;
}

export interface RegisterResponse {
  exist: boolean;
  message: string;
  user?: { FName: string; LName: string; email: string };
}

export interface VerifyEmailResponse {
  verification: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  send: boolean;
  message: string;
  email: string;
}

export interface ResetPasswordResponse {
  verification: boolean;
  message: string;
}

export interface RefreshResponse {
  token: string;
}

export interface ProfileResponse {
  message: string;
  result: UserProfile;
}

export interface ChangePasswordResponse {
  result: { message: string; match: boolean };
}

/** `POST /search` answers with a bare array, not an envelope. */
export type SearchTripsResponse = Trip[];

export interface CreateOrderResponse {
  orderId: string;
  bookingId: string;
  reference: string;
  amount: string;
  currency: string;
  priceEGP: number;
  expiresAt: string;
}

export interface CaptureOrderResponse {
  message: string;
  booking: {
    reference: string;
    status: string;
    seatNumber: number;
    priceEGP: number;
  };
}

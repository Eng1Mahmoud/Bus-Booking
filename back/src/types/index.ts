import type { Types } from "mongoose";

export type UserRole = "user" | "admin";

/** Claims carried by an access token. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by `authMiddleware` once a token has been verified. */
      user?: AccessTokenPayload;
      /** Set by the `validate` middleware. */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export interface BookingHistoryEntry {
  date: string;
  from: string;
  to: string;
  seatPrice: number;
  busNumber: number;
  seatNumber: number;
  serialBook?: string;
}

export interface Seat {
  seatNumber: number;
  status: boolean;
}

export interface Bus {
  _id?: Types.ObjectId;
  number: string;
  time: string;
  price: number;
  capacity?: number;
  seats: Seat[];
}

export {};

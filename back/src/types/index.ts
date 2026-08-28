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
  /**
   * True means unavailable — held for a checkout in progress, or sold.
   *
   * Kept boolean because the frontend renders `seat.status` directly. The two
   * unavailable states are told apart by `heldUntil`: set while a checkout is
   * running, cleared once payment is captured.
   */
  status: boolean;
  /** When a pending hold lapses. Absent on free and on sold seats. */
  heldUntil?: Date | null;
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

/** Shapes returned by the API. Kept in step with `back/src/types/index.ts`. */

export interface Seat {
  seatNumber: number;
  /** True means unavailable — held for a checkout in progress, or sold. */
  status: boolean;
}

export interface Bus {
  _id?: string;
  number: string;
  time: string;
  price: number;
  capacity?: number;
  seats: Seat[];
}

export interface Trip {
  _id: string;
  from: string;
  to: string;
  /** `YYYY-M-D`, matching what the API stores. */
  date: string;
  bus: Bus[];
}

/** One row of a bus within a trip, flattened for the booking dialog. */
export interface TripDetails {
  from: string;
  to: string;
  date: string;
  busNumber: string;
  time: string;
  price: number;
  seats: Seat[];
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

export interface UserProfile {
  _id: string;
  FName: string;
  LName: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  bookingsHistory: BookingHistoryEntry[];
}

export interface CreateOrderResponse {
  orderId: string;
  bookingId: string;
  reference: string;
  amount: string;
  currency: string;
  priceEGP: number;
  expiresAt: string;
}

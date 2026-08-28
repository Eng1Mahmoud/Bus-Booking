import { z } from "zod";
import { tripDateSchema } from "./tripSchemas.js";

/**
 * TODO(S3) — CRITICAL. `seatePrice` is accepted from the client and written
 * straight to the booking history, and nothing here verifies that a payment
 * ever happened. Phase 3 replaces this endpoint with a PayPal
 * create-order / capture pair that reads the price from the trip document.
 *
 * The misspelling is preserved because Book.jsx:36 sends that exact key.
 */
export const createBookingSchema = z.object({
  from: z.string().trim().min(1).max(100),
  to: z.string().trim().min(1).max(100),
  date: tripDateSchema,
  busNumber: z.union([z.string(), z.number()]).transform(String),
  seatNumber: z.coerce.number().int().positive(),
  seatePrice: z.coerce.number().nonnegative(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

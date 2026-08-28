import { z } from "zod";

/**
 * Dates are persisted as `YYYY-M-D` strings (no zero padding) because that is
 * what `dayjs(...).format("YYYY-M-D")` produces on the frontend and what the
 * existing Atlas documents contain. Phase 3 migrates this to a real Date.
 */
export const tripDateSchema = z
  .string()
  .regex(/^\d{4}-\d{1,2}-\d{1,2}$/, "Date must be in YYYY-M-D format");

const citySchema = z.string().trim().min(1).max(100);

export const searchTripsSchema = z.object({
  from: citySchema,
  to: citySchema,
  date: tripDateSchema,
});

export type SearchTripsInput = z.infer<typeof searchTripsSchema>;

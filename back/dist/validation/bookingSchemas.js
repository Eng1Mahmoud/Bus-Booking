import { z } from "zod";
import { tripDateSchema } from "./tripSchemas.js";
/**
 * Identifies a seat. Note what is *not* here: a price.
 *
 * The old booking endpoint took `seatePrice` from the request body and wrote it
 * straight to the user's history, so a caller named their own fare — and since
 * nothing verified a payment either, they could skip paying entirely. The price
 * is now read from the trip document at order time and the client is never
 * asked for it.
 */
export const seatSelectionSchema = z.object({
    from: z.string().trim().min(1).max(100),
    to: z.string().trim().min(1).max(100),
    date: tripDateSchema,
    busNumber: z.union([z.string(), z.number()]).transform(String),
    seatNumber: z.coerce.number().int().positive(),
});
export const paypalOrderIdSchema = z.object({
    orderId: z
        .string()
        .trim()
        .regex(/^[A-Z0-9]{5,32}$/i, "Invalid order id"),
});
//# sourceMappingURL=bookingSchemas.js.map
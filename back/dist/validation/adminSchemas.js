import { z } from "zod";
import { emailSchema, passwordSchema } from "./authSchemas.js";
import { tripDateSchema } from "./tripSchemas.js";
export const adminLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});
export const addAdminSchema = z.object({
    name: z.string().trim().min(1).max(80),
    email: emailSchema,
    password: passwordSchema,
});
export const addTripSchema = z.object({
    from: z.string().trim().min(1).max(100),
    to: z.string().trim().min(1).max(100),
    date: tripDateSchema,
    busNumber: z.union([z.string(), z.number()]).transform(String),
    time: z.string().trim().min(1).max(20),
    capacity: z.coerce.number().int().min(1).max(120),
    priceSeat: z.coerce.number().nonnegative(),
});
export const deleteTripParamsSchema = z.object({
    from: z.string().trim().min(1),
    to: z.string().trim().min(1),
    date: tripDateSchema,
    busNumber: z.string().trim().min(1),
});
//# sourceMappingURL=adminSchemas.js.map
import { z } from "zod";
import type { Dayjs } from "dayjs";

/**
 * Validation lives here, once, and is shared by the form and its types.
 *
 * Each screen used to carry its own hand-written `validate` function with the
 * same email regex copy-pasted five times, and the rules drifted: sign-in
 * demanded eight characters, change-password six, and the API twelve.
 */
const email = z.string().trim().min(1, "Required").email("Invalid email address");

// Matches the API's own floor, so a password the form accepts is never
// rejected by the server.
const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128);

export const loginSchema = z.object({ email, password });

export const signUpSchema = z.object({
  FName: z.string().trim().min(1, "Please enter first name").max(60),
  LName: z.string().trim().min(1, "Please enter last name").max(60),
  email,
  password,
});

export const verificationSchema = z.object({
  verificationCode: z
    .string()
    .trim()
    .min(1, "Please enter verification code")
    .regex(/^\d{4,6}$/, "The code is 6 digits"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  verificationCode: z
    .string()
    .trim()
    .min(1, "Please enter verification code")
    .regex(/^\d{4,6}$/, "The code is 6 digits"),
  password,
});

export const profileSchema = z.object({
  FName: z.string().trim().min(1, "Required").max(60),
  LName: z.string().trim().min(1, "Required").max(60),
  email,
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(1, "Required"),
    newPassword: password,
  })
  // Caught here rather than after a round trip that would have succeeded.
  .refine((values) => values.password !== values.newPassword, {
    path: ["newPassword"],
    message: "The new password must be different",
  });

export const searchSchema = z.object({
  from: z.string().min(1, "Please choose a departure station"),
  to: z.string().min(1, "Please choose a destination"),
  // MUI's picker hands back a Dayjs, or null when the field is cleared.
  date: z.custom<Dayjs | null>(
    (value) => value != null && typeof value === "object",
    "Please pick a date",
  ),
});

export type SearchValues = z.infer<typeof searchSchema>;

export type LoginValues = z.infer<typeof loginSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerificationValues = z.infer<typeof verificationSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

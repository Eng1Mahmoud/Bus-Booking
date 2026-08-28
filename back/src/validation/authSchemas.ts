import { z } from "zod";

export const emailSchema = z.string().trim().email("Invalid email address");

/**
 * Eight characters matches what the frontend already enforces in SignIn.jsx and
 * SignUp.jsx. Phase 2 raises the floor and adds a breach-list check on signup.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128);

export const registerSchema = z.object({
  FName: z.string().trim().min(1, "Please enter first name").max(60),
  LName: z.string().trim().min(1, "Please enter last name").max(60),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * TODO(S1/S2): `verification_code` is the server's own code echoed back by the
 * browser, and is the reason any account can currently be taken over. It is
 * accepted here only so the deployed frontend keeps working through this
 * phase; the field is dropped in Phase 2, when the code is looked up from the
 * VerificationToken collection instead.
 */
export const verifyEmailSchema = z.object({
  verificationCode: z.string().trim().min(1, "Please enter verification code"),
  verification_code: z.string().trim().optional(),
  user: registerSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  verificationCode: z.string().trim().min(1, "Please enter verification code"),
  verification_code: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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
 * `verification_code` is accepted but IGNORED.
 *
 * It used to be the server's own code, echoed back by the browser and compared
 * against the user's input. The code
 * is now looked up from PendingRegistration / VerificationToken and this field
 * is read nowhere. It stays in the schema only so the deployed frontend, which
 * still sends it, does not fail validation. Phase 5 stops sending it and it is
 * removed here.
 */
export const verifyEmailSchema = z.object({
  verificationCode: z.string().trim().min(1, "Please enter verification code"),
  verification_code: z.string().trim().optional(),
  /**
   * Only `email` is used, to find the pending registration. Every other field
   * is read from the server's own row.
   *
   * The name and password fields are optional because registration no longer
   * returns them: the browser used to be handed back the whole submitted user
   * object and send it here to be persisted
   * verbatim. Old clients that still hold one in sessionStorage keep working;
   * what they send is discarded.
   */
  user: z.object({
    email: emailSchema,
    FName: z.string().optional(),
    LName: z.string().optional(),
    password: z.string().optional(),
  }),
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

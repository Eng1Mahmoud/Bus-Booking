import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signLegacyToken } from "../utils/jwt.js";
import { sendVerificationCode } from "../utils/mailer.js";
import { env } from "../config/env.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validation/authSchemas.js";

/**
 * `crypto.randomInt` rather than `Math.random`, which is not a CSPRNG, and
 * whose `.toString(10).substring(2, 6)` could yield fewer than four digits.
 */
const generateCode = (): string =>
  crypto.randomInt(0, 10_000).toString().padStart(4, "0");

export const authService = {
  /**
   * TODO(S2) — the returned `verification_code` and `user` are what make signup
   * verification meaningless: the browser receives the code it is meant to
   * prove it received by email, and holds the plaintext password in
   * sessionStorage until the second step.
   *
   * Kept for now because the deployed frontend reads both fields
   * (SignUp.jsx:79-80). Phase 2 persists a hashed code server-side and returns
   * nothing but a message.
   */
  async register({ email, ...rest }: RegisterInput) {
    const existing = await User.exists({ email });

    if (existing) {
      return { exist: true, message: "user already exists" } as const;
    }

    const code = generateCode();
    await sendVerificationCode(email, code);

    return {
      exist: false,
      verification_code: code,
      user: { email, ...rest },
    } as const;
  },

  /**
   * TODO(S2) — compares two values that both arrived from the client, then
   * persists the client-supplied `user` object wholesale. Neither the email nor
   * the code is ever proven. Phase 2 replaces this entirely.
   */
  async verifyEmail({ verificationCode, verification_code, user }: VerifyEmailInput) {
    if (!verification_code || verificationCode !== verification_code) {
      return { verification: false, message: "كود التحقق غير صحيح" } as const;
    }

    const existing = await User.exists({ email: user.email });
    if (existing) {
      throw ApiError.conflict("user already exists");
    }

    const password = await bcrypt.hash(user.password, env.BCRYPT_ROUNDS);
    await User.create({ ...user, password });

    return { verification: true, message: "تم انشاء الحساب بنجاح" } as const;
  },

  async login({ email, password }: LoginInput) {
    // `password` is `select: false` on the schema, so it has to be asked for.
    const user = await User.findOne({ email }).select("+password").exec();

    if (!user) {
      return { exist: false, message: "User Not Found " } as const;
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return { exist: false, message: "Password Incorrect" } as const;
    }

    return {
      exist: true,
      message: "login success",
      token: signLegacyToken(user.email),
    } as const;
  },

  /**
   * TODO(S1) — CRITICAL. Returning `verification_code` here is one half of the
   * account-takeover chain; `resetPassword` below is the other. Phase 2 stores
   * a hashed, single-use, expiring code and stops returning it.
   *
   * TODO(S8) — this will email any address supplied. `mailLimiter` now caps it
   * at 5 requests per hour per IP, which bounds the abuse but does not fix it.
   */
  async forgotPassword({ email }: ForgotPasswordInput) {
    const code = generateCode();
    await sendVerificationCode(email, code);

    return {
      send: true,
      message: "send verivecation",
      email,
      verification_code: code,
    } as const;
  },

  /**
   * TODO(S1) — CRITICAL. `verificationCode` and `verification_code` both come
   * from the request body, so any matching pair resets any account. This is
   * unchanged from the original implementation and is the first thing Phase 2
   * removes.
   */
  async resetPassword({
    email,
    password,
    verificationCode,
    verification_code,
  }: ResetPasswordInput) {
    if (!verification_code || verificationCode !== verification_code) {
      return {
        verification: false,
        message: "Invalid verification code",
      } as const;
    }

    const hashed = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const updated = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true },
    ).exec();

    if (!updated) {
      return { verification: false, message: "User not found" } as const;
    }

    return { verification: true, message: "Password updated" } as const;
  },
};

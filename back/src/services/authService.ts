import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { PendingRegistration } from "../models/PendingRegistration.js";
import { VerificationToken } from "../models/VerificationToken.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { sendVerificationCode } from "../utils/mailer.js";
import { codeMatches, generateVerificationCode, hashCode } from "../utils/codes.js";
import { tokenService, type IssuedTokens } from "./tokenService.js";
import { env } from "../config/env.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validation/authSchemas.js";

/** A 6-digit code is 1,000,000 possibilities; five tries makes guessing futile. */
const MAX_CODE_ATTEMPTS = 5;

const codeExpiry = (): Date =>
  new Date(Date.now() + env.VERIFICATION_CODE_TTL_MINUTES * 60_000);

export const authService = {
  /**
   * Starts a signup. Fixes S2.
   *
   * The code is emailed and stored hashed; it is no longer returned to the
   * browser, which is what made the old email check meaningless. The password
   * is hashed here and held server-side, so it never round-trips through
   * sessionStorage in plaintext as it did before.
   *
   * The response still carries `{ exist, user }` because SignUp.jsx reads both,
   * but `user` now contains only the name and email.
   */
  async register({ email, password, FName, LName }: RegisterInput) {
    if (await User.exists({ email })) {
      return { exist: true, message: "user already exists" } as const;
    }

    const code = generateVerificationCode();

    // A repeat signup for the same address replaces the pending row and its
    // code, rather than leaving several valid codes outstanding.
    await PendingRegistration.findOneAndUpdate(
      { email },
      {
        FName,
        LName,
        email,
        passwordHash: await bcrypt.hash(password, env.BCRYPT_ROUNDS),
        codeHash: hashCode(code),
        expiresAt: codeExpiry(),
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();

    await sendVerificationCode(email, code);

    return {
      exist: false,
      message: "Verification code sent to your email",
      user: { FName, LName, email },
    } as const;
  },

  /**
   * Completes a signup. Fixes S2.
   *
   * The submitted code is checked against the hash stored at registration
   * time. The `verification_code` and `user` fields the frontend still sends
   * are ignored entirely — only `user.email` is used, to find the pending row.
   */
  async verifyEmail({ verificationCode, user }: VerifyEmailInput) {
    const pending = await PendingRegistration.findOne({
      email: user.email,
    }).exec();

    if (!pending || pending.expiresAt.getTime() <= Date.now()) {
      return {
        verification: false,
        message: "كود التحقق غير صحيح",
      } as const;
    }

    if (pending.attempts >= MAX_CODE_ATTEMPTS) {
      throw ApiError.tooMany("Too many incorrect attempts. Please start again.");
    }

    if (!codeMatches(verificationCode, pending.codeHash)) {
      pending.attempts += 1;
      await pending.save();
      return { verification: false, message: "كود التحقق غير صحيح" } as const;
    }

    if (await User.exists({ email: pending.email })) {
      await pending.deleteOne();
      throw ApiError.conflict("user already exists");
    }

    // Every field comes from the pending row, not from the request — the old
    // version persisted the client-supplied `user` object wholesale, so the
    // caller chose their own role and verification state.
    await User.create({
      FName: pending.FName,
      LName: pending.LName,
      email: pending.email,
      password: pending.passwordHash,
      role: "user",
      isVerified: true,
    });

    await pending.deleteOne();

    return { verification: true, message: "تم انشاء الحساب بنجاح" } as const;
  },

  async login({
    email,
    password,
  }: LoginInput): Promise<
    | { exist: false; message: string }
    | { exist: true; message: string; tokens: IssuedTokens }
  > {
    const user = await User.findOne({ email }).select("+password").exec();

    if (!user) {
      // bcrypt on a dummy hash so a missing account takes the same time as a
      // wrong password, and response timing stops revealing which emails exist.
      await bcrypt.compare(password, "$2a$12$" + "x".repeat(53));
      return { exist: false, message: "User Not Found " };
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return { exist: false, message: "Password Incorrect" };
    }

    return {
      exist: true,
      message: "login success",
      tokens: await tokenService.issue({
        subject: user.id as string,
        email: user.email,
        role: user.role,
      }),
    };
  },

  /**
   * Sends a password reset code. Fixes S1 and S8.
   *
   * The code is no longer in the response. The reply is also identical whether
   * or not the address is registered, so this endpoint cannot be used to
   * enumerate accounts.
   */
  async forgotPassword({ email }: ForgotPasswordInput) {
    const user = await User.findOne({ email }).select("_id").exec();

    if (user) {
      const code = generateVerificationCode();

      // Invalidate any earlier outstanding code for this address.
      await VerificationToken.deleteMany({
        email,
        purpose: "password_reset",
      }).exec();

      await VerificationToken.create({
        email,
        purpose: "password_reset",
        codeHash: hashCode(code),
        expiresAt: codeExpiry(),
      });

      await sendVerificationCode(email, code);
    } else {
      logger.info({ email }, "Password reset requested for unknown address");
    }

    return {
      send: true,
      message: "If that address is registered, a code has been sent",
      email,
    } as const;
  },

  /**
   * Completes a password reset. Fixes S1 — the critical one.
   *
   * The submitted code is compared against a hash the server stored and
   * emailed. The `verification_code` field the frontend still sends is read
   * nowhere: previously it was the *other* half of the comparison, so any
   * matching pair of client-supplied values reset any account.
   */
  async resetPassword({ email, password, verificationCode }: ResetPasswordInput) {
    const token = await VerificationToken.findOne({
      email,
      purpose: "password_reset",
      consumedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .exec();

    if (!token || token.expiresAt.getTime() <= Date.now()) {
      return {
        verification: false,
        message: "Invalid verification code",
      } as const;
    }

    if (token.attempts >= MAX_CODE_ATTEMPTS) {
      throw ApiError.tooMany("Too many incorrect attempts. Please start again.");
    }

    if (!codeMatches(verificationCode, token.codeHash)) {
      token.attempts += 1;
      await token.save();
      return {
        verification: false,
        message: "Invalid verification code",
      } as const;
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return { verification: false, message: "User not found" } as const;
    }

    user.password = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await user.save();

    // Single-use: mark it consumed before returning, so a replay of the same
    // request cannot reset the password a second time.
    token.consumedAt = new Date();
    await token.save();

    // Whoever triggered the reset may have been locked out by an attacker with
    // a live session. Drop every session for the account.
    await tokenService.revokeAllForSubject(user.id as string);

    return { verification: true, message: "Password updated" } as const;
  },
};

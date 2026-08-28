import bcrypt from "bcryptjs";
import { User, type UserDocument } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import type {
  ChangePasswordInput,
  UpdateProfileInput,
  UploadAvatarInput,
} from "../validation/userSchemas.js";

/** Fields safe to return to the account's owner. Never includes `password`. */
const PUBLIC_FIELDS = "FName LName email image role bookingsHistory createdAt";

export const userService = {
  async getByEmail(email: string): Promise<UserDocument> {
    const user = await User.findOne({ email })
      .select(PUBLIC_FIELDS)
      .lean<UserDocument>()
      .exec();

    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async updateProfile(
    currentEmail: string,
    input: UpdateProfileInput,
  ): Promise<UserDocument> {
    // The original passed the email *string* as the filter
    // (`findOneAndUpdate(email, …)`), which mongoose could not use as a query,
    // so profile updates never applied to the right document.
    const updated = await User.findOneAndUpdate(
      { email: currentEmail },
      { FName: input.FName, LName: input.LName, email: input.email },
      { new: true, runValidators: true },
    )
      .select(PUBLIC_FIELDS)
      .lean<UserDocument>()
      .exec();

    if (!updated) throw ApiError.notFound("User not found");
    return updated;
  },

  async changePassword(
    email: string,
    { password, newPassword }: ChangePasswordInput,
  ): Promise<{ message: string; match: boolean }> {
    const user = await User.findOne({ email }).select("+password").exec();
    if (!user) throw ApiError.notFound("User not found");

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return {
        message: "The current password you entered is incorrect",
        match: false,
      };
    }

    user.password = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await user.save();

    return { message: "Password changed successfully", match: true };
  },

  async updateAvatar(
    email: string,
    { image }: UploadAvatarInput,
  ): Promise<UserDocument> {
    // `upsert: true` was in the original and would happily create a document
    // with only an image and no required fields. Dropped.
    const updated = await User.findOneAndUpdate({ email }, { image }, { new: true })
      .select(PUBLIC_FIELDS)
      .lean<UserDocument>()
      .exec();

    if (!updated) throw ApiError.notFound("User not found");
    return updated;
  },

  /**
   * TODO(S7) — still reachable by any authenticated caller, which per S4 means
   * any registered user. Phase 2 puts this behind `adminMiddleware`. The
   * projection at least stops the password hashes and full booking history
   * from leaving the server in the meantime.
   */
  async listAll(): Promise<UserDocument[]> {
    return User.find()
      .select("FName LName email image role createdAt")
      .sort({ createdAt: -1 })
      .lean<UserDocument[]>()
      .exec();
  },

  /** TODO(S4/S7) — admin-only from Phase 2. */
  async deleteByEmail(email: string): Promise<void> {
    // The original passed `req.params.email` (a string) as the filter.
    const deleted = await User.findOneAndDelete({ email }).exec();
    if (!deleted) throw ApiError.notFound("User not found");
  },
};

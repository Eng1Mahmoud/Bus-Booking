import bcrypt from "bcryptjs";
import { Admin, type AdminDocument } from "../models/Admin.js";
import { Trip } from "../models/Trip.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { tokenService, type IssuedTokens } from "./tokenService.js";
import { env } from "../config/env.js";
import type {
  AddAdminInput,
  AddTripInput,
  AdminLoginInput,
  DeleteTripParams,
} from "../validation/adminSchemas.js";

/** bcrypt hashes always start with $2a$, $2b$ or $2y$. */
const isBcryptHash = (value: string): boolean => /^\$2[aby]\$/.test(value);

export const adminService = {
  /**
   * *
   * Passwords are bcrypt-hashed from now on. Rows written before this phase are
   * plaintext, so a stored value that is not a bcrypt hash is compared
   * directly, then rehashed in place — that upgrade-on-login path is what stops
   * every existing admin from being locked out the moment this deploys.
   *
   * Run `npm run migrate:admins` to convert them all up front; once no
   * plaintext rows remain, delete the fallback below.
   */
  async login({
    email,
    password,
  }: AdminLoginInput): Promise<
    | { exist: false; message: string }
    | { exist: true; message: string; tokens: IssuedTokens }
  > {
    const admin = await Admin.findOne({ email }).select("+password").exec();

    if (!admin) {
      await bcrypt.compare(password, "$2a$12$" + "x".repeat(53));
      return { exist: false, message: "Admin Not Found " };
    }

    let authenticated: boolean;

    if (isBcryptHash(admin.password)) {
      authenticated = await bcrypt.compare(password, admin.password);
    } else {
      authenticated = admin.password === password;

      if (authenticated) {
        admin.password = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
        await admin.save();
        logger.warn(
          { email },
          "Upgraded a plaintext admin password to bcrypt on login",
        );
      }
    }

    if (!authenticated) {
      return { exist: false, message: "Password is incorrect" };
    }

    return {
      exist: true,
      message: "Login Success",
      tokens: await tokenService.issue({
        subject: admin.id as string,
        email: admin.email,
        // The only place an admin role claim is ever minted.
        role: "admin",
      }),
    };
  },

  async listAdmins(): Promise<AdminDocument[]> {
    return Admin.find().select("name email createdAt").lean<AdminDocument[]>().exec();
  },

  async addAdmin(input: AddAdminInput) {
    if (await Admin.exists({ email: input.email })) {
      return { message: "Admin already exists" } as const;
    }

    await Admin.create({
      ...input,
      password: await bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    });

    return { message: "Admin added successfully" } as const;
  },

  /** Refuses to remove the last admin, which would lock everyone out. */
  async deleteAdmin(email: string) {
    const count = await Admin.countDocuments().exec();

    if (count <= 1) {
      return {
        message:
          "This administrator cannot be deleted before you add another. The site should not become without an administrator ",
        admins: await this.listAdmins(),
      } as const;
    }

    const deleted = await Admin.findOneAndDelete({ email }).exec();
    if (!deleted) {
      throw ApiError.notFound("Admin not found");
    }

    // Their live sessions should not outlive the account.
    await tokenService.revokeAllForSubject(deleted.id as string);

    return {
      message: "Admin deleted successfully",
      admins: await this.listAdmins(),
    } as const;
  },

  async addTrip(input: AddTripInput) {
    const { from, to, date, busNumber, time, capacity, priceSeat } = input;

    if (await Trip.exists({ "bus.number": busNumber })) {
      return {
        message:
          "This bus number already exists. Please choose a different bus number.",
      } as const;
    }

    const newBus = {
      number: busNumber,
      price: priceSeat,
      time,
      capacity,
      seats: Array.from({ length: capacity }, (_, i) => ({
        seatNumber: i + 1,
        status: false,
      })),
    };

    // One upsert instead of the original find-then-branch, which raced with
    // itself when two trips were added for the same route on the same date.
    await Trip.updateOne(
      { from, to, date },
      { $push: { bus: newBus }, $setOnInsert: { from, to, date } },
      { upsert: true },
    ).exec();

    return { message: "Trip added successfully" } as const;
  },

  /**
   * TODO(Phase 3) — keyed on four positional URL segments instead of an id,
   * so a city containing a slash breaks the route.
   */
  async deleteTripBus({ from, to, date, busNumber }: DeleteTripParams) {
    const updated = await Trip.findOneAndUpdate(
      { from, to, date },
      { $pull: { bus: { number: busNumber } } },
      { new: true },
    ).exec();

    if (!updated) {
      throw ApiError.notFound("Trip not found");
    }

    if (updated.bus.length === 0) {
      await Trip.deleteOne({ _id: updated._id }).exec();
      return { message: "Trip deleted successfully" } as const;
    }

    return { message: "Bus deleted from the trip successfully" } as const;
  },
};

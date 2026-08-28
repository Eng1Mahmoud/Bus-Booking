import { Admin, type AdminDocument } from "../models/Admin.js";
import { Trip } from "../models/Trip.js";
import { ApiError } from "../utils/ApiError.js";
import { signLegacyToken } from "../utils/jwt.js";
import type {
  AddAdminInput,
  AddTripInput,
  AdminLoginInput,
  DeleteTripParams,
} from "../validation/adminSchemas.js";

export const adminService = {
  /**
   * TODO(S5) — CRITICAL. Passwords in this collection are PLAINTEXT and the
   * comparison below is a string equality check. Phase 2 hashes them and
   * migrates the existing rows; hashing here first would lock out every
   * current admin, so the two must land together.
   */
  async login({ email, password }: AdminLoginInput) {
    const admin = await Admin.findOne({ email }).select("+password").exec();

    if (!admin) {
      return { exist: false, message: "Admin Not Found " } as const;
    }

    if (admin.password !== password) {
      return { exist: false, message: "Password is incorrect" } as const;
    }

    return {
      exist: true,
      message: "Login Success",
      token: signLegacyToken(admin.email),
    } as const;
  },

  async listAdmins(): Promise<AdminDocument[]> {
    return Admin.find().select("name email createdAt").lean<AdminDocument[]>().exec();
  },

  /** TODO(S5) — stores the password as sent. Hashed in Phase 2. */
  async addAdmin(input: AddAdminInput) {
    const existing = await Admin.exists({ email: input.email });
    if (existing) {
      return { message: "Admin already exists" } as const;
    }

    await Admin.create(input);
    return { message: "Admin added successfully" } as const;
  },

  /** Refuses to remove the last admin, which would lock everyone out. */
  async deleteAdmin(email: string) {
    const count = await Admin.countDocuments().exec();

    if (count <= 1) {
      const admins = await this.listAdmins();
      return {
        message:
          "This administrator cannot be deleted before you add another. The site should not become without an administrator ",
        admins,
      } as const;
    }

    const deleted = await Admin.findOneAndDelete({ email }).exec();
    if (!deleted) {
      throw ApiError.notFound("Admin not found");
    }

    return {
      message: "Admin deleted successfully",
      admins: await this.listAdmins(),
    } as const;
  },

  async addTrip(input: AddTripInput) {
    const { from, to, date, busNumber, time, capacity, priceSeat } = input;

    const clash = await Trip.exists({ "bus.number": busNumber });
    if (clash) {
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

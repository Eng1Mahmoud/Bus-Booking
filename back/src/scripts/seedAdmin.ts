/**
 * Creates an admin account.
 *
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='...' npm run seed:admin
 *
 * Kept separate from `npm run seed` because it needs a password, and a script
 * that needs a credential should be one you run deliberately.
 *
 * The password is read from the environment rather than baked in or prompted,
 * so it never reaches a committed file, a shell history entry you did not
 * intend, or this repository. It is hashed before it is stored — admin
 * passwords used to be kept in plaintext, which is finding S5.
 */
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { logger } from "../utils/logger.js";

const run = async (): Promise<void> => {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "\nSet both variables, then run again:\n\n" +
        "  SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='your-password' npm run seed:admin\n\n" +
        "On PowerShell:\n\n" +
        '  $env:SEED_ADMIN_EMAIL="you@example.com"; $env:SEED_ADMIN_PASSWORD="your-password"; npm run seed:admin\n',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\nSEED_ADMIN_PASSWORD must be at least 8 characters.\n");
    process.exit(1);
  }

  await connectDB();

  const existing = await Admin.findOne({ email }).exec();

  if (existing) {
    // Resetting a forgotten password is the common reason to re-run this.
    existing.password = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await existing.save();
    logger.info({ email }, "Existing admin's password updated");
  } else {
    await Admin.create({
      name: email.split("@")[0],
      email,
      password: await bcrypt.hash(password, env.BCRYPT_ROUNDS),
    });
    logger.info({ email }, "Admin created");
  }

  const total = await Admin.countDocuments();
  logger.info({ total }, "Admins in the database");

  await disconnectDB();
};

run().catch((error) => {
  logger.fatal({ err: error }, "Admin seeding failed");
  process.exit(1);
});

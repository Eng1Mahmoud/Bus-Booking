/**
 * One-off migration: bcrypt every plaintext admin password.
 *
 * Admin passwords were stored as-is and compared with `!==`, so a database dump
 * handed over every admin credential. Run this once after deploying Phase 2:
 *
 *   npm run migrate:admins
 *
 * It is idempotent — rows that already hold a bcrypt hash are skipped, so
 * running it twice is harmless. `adminService.login` also upgrades a plaintext
 * row on successful login, so nobody is locked out if this is forgotten; once
 * this reports 0 remaining, delete that fallback.
 */
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { logger } from "../utils/logger.js";

const isBcryptHash = (value: string): boolean => /^\$2[aby]\$/.test(value);

const run = async (): Promise<void> => {
  await connectDB();

  const admins = await Admin.find().select("+password email").exec();
  let hashed = 0;
  let skipped = 0;

  for (const admin of admins) {
    if (isBcryptHash(admin.password)) {
      skipped += 1;
      continue;
    }

    admin.password = await bcrypt.hash(admin.password, env.BCRYPT_ROUNDS);
    await admin.save();
    hashed += 1;
    logger.info({ email: admin.email }, "Hashed admin password");
  }

  logger.info(
    { total: admins.length, hashed, alreadyHashed: skipped },
    "Admin password migration complete",
  );

  await disconnectDB();
};

run().catch((error) => {
  logger.fatal({ err: error }, "Admin password migration failed");
  process.exit(1);
});

/**
 * Runs the API against a throwaway in-memory MongoDB, seeded with enough data
 * to click through the whole app.
 *
 *   npm run dev:local
 *
 * Nothing external is required — no Atlas, no local mongod, no credentials.
 * The database is created on start and discarded on exit, so every run begins
 * from the same known state. Use it to try the app, to reproduce a bug against
 * clean data, or when the real cluster is unreachable.
 *
 * `npm run dev` remains the normal path and uses MONGO_URI from .env.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

const mongo = await MongoMemoryServer.create();

// Set before anything imports config/env.ts, which validates and freezes the
// environment at module load. Hence the dynamic imports further down.
process.env.MONGO_URI = mongo.getUri("bus-booking-local");
process.env.NODE_ENV = process.env.NODE_ENV ?? "development";
process.env.PORT = process.env.PORT ?? "5000";
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? "http://localhost:3000";
// Fixed, so a restart does not invalidate the session in an open browser tab.
process.env.JWT_ACCESS_SECRET = "local-development-access-secret-not-a-real-key";
process.env.JWT_REFRESH_SECRET = "local-development-refresh-secret-not-a-real-key";
// The lowest the config allows: seeding is noticeably faster, and nothing here
// is a real credential.
process.env.BCRYPT_ROUNDS = "10";

const { createApp } = await import("../app.js");
const { connectDB } = await import("../config/db.js");
const { env } = await import("../config/env.js");
const { User } = await import("../models/User.js");
const { Admin } = await import("../models/Admin.js");
const { Trip } = await import("../models/Trip.js");

await connectDB();

const RIDER = { email: "rider@example.com", password: "rider-password-1" };
const ADMIN = { email: "admin@example.com", password: "admin-password-1" };

await User.create({
  FName: "Test",
  LName: "Rider",
  email: RIDER.email,
  password: await bcrypt.hash(RIDER.password, 10),
  role: "user",
  isVerified: true,
});

await Admin.create({
  name: "Test Admin",
  email: ADMIN.email,
  password: await bcrypt.hash(ADMIN.password, 10),
});

/**
 * Routes use station names, not city names — the city entries in the search
 * dropdown are group headings and cannot be selected.
 */
const routes = [
  { from: "El Nasr Street", to: "Ramsis", price: 300 },
  { from: "Ramsis", to: "El Nasr Street", price: 300 },
  { from: "Sidi Gaber", to: "Ramsis", price: 180 },
];

// Today plus the next six days, in the unpadded YYYY-M-D the API stores.
const dates = Array.from({ length: 7 }, (_, offset) => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
});

let busNumber = 100;

for (const route of routes) {
  for (const date of dates) {
    busNumber += 1;
    await Trip.create({
      from: route.from,
      to: route.to,
      date,
      bus: [
        {
          number: String(busNumber),
          time: "08:00",
          price: route.price,
          capacity: 12,
          // A couple of seats start sold, so the seat map is not uniformly
          // empty and "already taken" is visible without booking first.
          seats: Array.from({ length: 12 }, (_, i) => ({
            seatNumber: i + 1,
            status: i < 2,
            heldUntil: null,
          })),
        },
      ],
    });
  }
}

createApp().listen(env.PORT, () => {
  const line = "─".repeat(58);
  console.log(`\n${line}`);
  console.log(`  API          http://localhost:${env.PORT}`);
  console.log(`  Health       http://localhost:${env.PORT}/api/health`);
  console.log(`  Database     in-memory, discarded on exit`);
  console.log(line);
  console.log(`  Rider        ${RIDER.email} / ${RIDER.password}`);
  console.log(`  Admin        ${ADMIN.email} / ${ADMIN.password}`);
  console.log(line);
  console.log(`  Search       El Nasr Street -> Ramsis`);
  console.log(`               any date from today, 7 days ahead`);
  console.log(
    `  Payments     ${env.paypalEnabled ? "configured" : "not configured — /api/payments returns 503"}`,
  );
  console.log(
    `  Email        ${env.mailEnabled ? "configured" : "not configured — codes are written to this log"}`,
  );
  console.log(`${line}\n`);
});

const shutdown = async () => {
  await mongo.stop();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

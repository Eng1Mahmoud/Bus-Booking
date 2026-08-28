/**
 * Seeds trips into whatever database MONGO_URI points at.
 *
 *   npm run seed              # add trips for the next 14 days
 *   npm run seed -- --days 30 # a longer window
 *   npm run seed -- --reset   # delete existing trips first
 *
 * This writes to a real database, so it is additive by default and refuses to
 * destroy anything unless `--reset` is passed explicitly. It only ever touches
 * the `trips` collection — accounts and bookings are never modified.
 *
 * Admins are created by a separate script (`npm run seed:admin`), because that
 * one needs a password and this one should be safe to run without thinking.
 */
import { connectDB, disconnectDB } from "../config/db.js";
import { Trip } from "../models/Trip.js";
import { logger } from "../utils/logger.js";

/**
 * Station names must match `front/src/constants/stations.ts` exactly — the
 * search form sends whatever the dropdown holds, and the API compares strings.
 * A typo here produces trips no one can find.
 */
const ROUTES = [
  {
    from: "El Nasr Street",
    to: "Ramsis",
    price: 300,
    times: ["07:00", "14:00", "23:00"],
  },
  {
    from: "Ramsis",
    to: "El Nasr Street",
    price: 300,
    times: ["08:00", "15:00", "23:30"],
  },
  { from: "Watanya-HRG", to: "Ramsis", price: 320, times: ["09:00", "21:00"] },
  { from: "Sidi Gaber", to: "Ramsis", price: 180, times: ["06:30", "13:00", "18:00"] },
  { from: "Ramsis", to: "Sidi Gaber", price: 180, times: ["07:30", "16:00"] },
  { from: "Ramsis", to: "Railway station", price: 420, times: ["20:00", "22:30"] },
  { from: "Railway station", to: "Ramsis", price: 420, times: ["19:00", "21:30"] },
  { from: "Watanya-SSH", to: "Ramsis", price: 350, times: ["10:00", "22:00"] },
  { from: "Dar ElTeb", to: "Ramsis", price: 260, times: ["07:00", "17:00"] },
  {
    from: "Qift",
    to: "Railway station",
    price: 90,
    times: ["08:00", "12:00", "16:00"],
  },
] as const;

const SEATS_PER_BUS = 28;

const arg = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
};

/** The unpadded `YYYY-M-D` the API stores and compares against. */
const formatDate = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const run = async (): Promise<void> => {
  const days = Number(arg("days") ?? 14);
  const reset = process.argv.includes("--reset");

  if (!Number.isInteger(days) || days < 1 || days > 90) {
    throw new Error("--days must be a whole number between 1 and 90");
  }

  await connectDB();

  const existing = await Trip.countDocuments();

  if (existing > 0 && !reset) {
    logger.warn(
      { existing },
      "Trips already exist. Nothing written — pass --reset to replace them.",
    );
    await disconnectDB();
    return;
  }

  if (reset && existing > 0) {
    await Trip.deleteMany({});
    logger.info({ removed: existing }, "Existing trips deleted");
  }

  const dates = Array.from({ length: days }, (_, offset) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    return formatDate(day);
  });

  let busNumber = 1000;
  const documents = [];

  for (const date of dates) {
    for (const route of ROUTES) {
      documents.push({
        from: route.from,
        to: route.to,
        date,
        bus: route.times.map((time) => {
          busNumber += 1;
          return {
            number: String(busNumber),
            time,
            price: route.price,
            capacity: SEATS_PER_BUS,
            seats: Array.from({ length: SEATS_PER_BUS }, (_, i) => ({
              seatNumber: i + 1,
              status: false,
              heldUntil: null,
            })),
          };
        }),
      });
    }
  }

  await Trip.insertMany(documents);

  logger.info(
    {
      trips: documents.length,
      buses: busNumber - 1000,
      days,
      from: dates[0],
      to: dates[dates.length - 1],
    },
    "Trips seeded",
  );

  await disconnectDB();
};

run().catch((error) => {
  logger.fatal({ err: error }, "Seeding failed");
  process.exit(1);
});

import { Types } from "mongoose";
import { Trip } from "../models/Trip.js";

/**
 * Seat writes, issued through the raw driver rather than the mongoose model.
 *
 * This is deliberate and load-bearing. Mongoose casts `arrayFilters` against
 * the schema and, for a doubly-nested path like `bus.$[bus].seats.$[seat]`,
 * silently DROPS conditions it cannot resolve. The condition dropped here was
 * `"seat.status": false` — the one that makes a seat claim atomic. Through the
 * model, a second caller's update applied happily to an already-taken seat and
 * both were told they had it. Through `Trip.collection`, the filter is sent
 * verbatim and the second caller gets `modifiedCount: 0`.
 *
 * A second trap, also proven rather than assumed: `$ne: null` on an array path
 * means "no element is null", so narrowing on `"bus.seats.heldUntil": { $ne:
 * null }` fails as soon as any seat on the bus is unheld — which is nearly
 * always. Every query below uses `$elemMatch`, where the conditions apply to a
 * single element.
 *
 * Keep these four functions together, and keep them on the raw collection.
 */
const collection = () => Trip.collection;

const oid = (id: string): Types.ObjectId => new Types.ObjectId(id);

/**
 * Claims a seat if and only if it is still free. Returns false if it was not.
 *
 * The gate appears twice on purpose: in the query filter (so the document only
 * matches while the seat is free) and in the array filter (so only that seat is
 * written). Either alone is sufficient; together they survive one of them being
 * mangled by a future driver change.
 */
export const claimSeat = async (
  tripId: string,
  busNumber: string,
  seatNumber: number,
  heldUntil: Date,
): Promise<boolean> => {
  const result = await collection().updateOne(
    {
      _id: oid(tripId),
      bus: {
        $elemMatch: {
          number: busNumber,
          seats: { $elemMatch: { seatNumber, status: false } },
        },
      },
    },
    {
      $set: {
        "bus.$[bus].seats.$[seat].status": true,
        "bus.$[bus].seats.$[seat].heldUntil": heldUntil,
      },
    },
    {
      arrayFilters: [
        { "bus.number": busNumber },
        { "seat.seatNumber": seatNumber, "seat.status": false },
      ],
    },
  );

  return result.modifiedCount === 1;
};

/** Puts a seat back on sale after a failed, cancelled or lapsed checkout. */
export const freeSeat = async (
  tripId: string,
  busNumber: string,
  seatNumber: number,
): Promise<void> => {
  await collection().updateOne(
    { _id: oid(tripId) },
    {
      $set: {
        "bus.$[bus].seats.$[seat].status": false,
        "bus.$[bus].seats.$[seat].heldUntil": null,
      },
    },
    {
      arrayFilters: [{ "bus.number": busNumber }, { "seat.seatNumber": seatNumber }],
    },
  );
};

/**
 * Turns a hold into a sale: still taken, but no longer on a clock. Clearing
 * `heldUntil` is what stops the expiry sweep from ever reselling a paid seat.
 */
export const sellSeat = async (
  tripId: string,
  busNumber: string,
  seatNumber: number,
): Promise<void> => {
  await collection().updateOne(
    { _id: oid(tripId) },
    {
      $set: {
        "bus.$[bus].seats.$[seat].status": true,
        "bus.$[bus].seats.$[seat].heldUntil": null,
      },
    },
    {
      arrayFilters: [{ "bus.number": busNumber }, { "seat.seatNumber": seatNumber }],
    },
  );
};

/**
 * Frees every seat whose hold lapsed without payment, across all trips.
 *
 * Only seats with a non-null `heldUntil` in the past are touched, so sold seats
 * (`heldUntil: null`) are never put back on sale.
 */
export const releaseLapsedHolds = async (now = new Date()): Promise<number> => {
  const result = await collection().updateMany(
    {
      bus: {
        $elemMatch: {
          seats: { $elemMatch: { heldUntil: { $ne: null, $lt: now } } },
        },
      },
    },
    {
      $set: {
        "bus.$[].seats.$[seat].status": false,
        "bus.$[].seats.$[seat].heldUntil": null,
      },
    },
    { arrayFilters: [{ "seat.heldUntil": { $ne: null, $lt: now } }] },
  );

  return result.modifiedCount;
};

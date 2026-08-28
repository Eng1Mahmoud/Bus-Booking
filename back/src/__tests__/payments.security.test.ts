import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { jsonPost, readJson, startTestServer, type TestContext } from "./helpers.js";

/**
 * Regression tests for S3 (payment bypass) and S11 (seat double-booking).
 *
 * PayPal itself is stubbed — the point of these tests is that *this server*
 * decides the price and refuses to confirm anything it has not captured and
 * checked, not that PayPal's API works.
 */
let ctx: TestContext;
let base: string;
let token: string;
let tripId: string;

const SEAT_PRICE_EGP = 300;

// What the stubbed PayPal will report as captured. Individual tests move it to
// simulate a customer tampering with the amount.
const capturedAmount = { value: "6.25", currency: "USD" };

beforeAll(async () => {
  ctx = await startTestServer(5302);
  base = ctx.baseUrl;

  process.env.PAYPAL_CLIENT_ID = "test-client-id";
  process.env.PAYPAL_CLIENT_SECRET = "test-client-secret";

  const { paypal } = await import("../config/paypal.js");
  vi.spyOn(paypal, "isConfigured").mockReturnValue(true);
  vi.spyOn(paypal, "createOrder").mockImplementation(async () => ({
    id: `ORDER${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    status: "CREATED",
  }));
  vi.spyOn(paypal, "captureOrder").mockImplementation(async (orderId) => ({
    id: orderId,
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: [
            {
              id: `CAP-${orderId}`,
              status: "COMPLETED",
              amount: {
                currency_code: capturedAmount.currency,
                value: capturedAmount.value,
              },
            },
          ],
        },
      },
    ],
  }));

  // A verified account, created directly — the signup flow is covered elsewhere.
  const bcrypt = (await import("bcryptjs")).default;
  const { User } = await import("../models/User.js");
  await User.create({
    FName: "Test",
    LName: "Rider",
    email: "rider@example.com",
    password: await bcrypt.hash("rider-password-1", 10),
    role: "user",
    isVerified: true,
  });

  const { Trip } = await import("../models/Trip.js");
  const trip = await Trip.create({
    from: "Cairo",
    to: "Luxor",
    date: "2030-1-1",
    bus: [
      {
        number: "101",
        time: "08:00",
        price: SEAT_PRICE_EGP,
        capacity: 4,
        seats: [1, 2, 3, 4].map((seatNumber) => ({
          seatNumber,
          status: false,
          heldUntil: null,
        })),
      },
    ],
  });
  tripId = trip.id as string;

  const login = await jsonPost(base, "/login", {
    email: "rider@example.com",
    password: "rider-password-1",
  });
  token = (await readJson<any>(login)).token;
});

afterAll(async () => {
  await ctx.stop();
});

const auth = () => ({ authorization: `Bearer ${token}` });

const seat = (seatNumber: number) => ({
  from: "Cairo",
  to: "Luxor",
  date: "2030-1-1",
  busNumber: "101",
  seatNumber,
});

describe("S3 — the free-ticket endpoint is gone", () => {
  it("returns 410 for the retired POST /book", async () => {
    const res = await jsonPost(base, "/book", { ...seat(1), seatePrice: 0 }, auth());

    expect(res.status).toBe(410);
    expect((await readJson<any>(res)).replacedBy).toBe("POST /api/payments/orders");
  });

  it("offers no POST /api/bookings either", async () => {
    const res = await jsonPost(base, "/api/bookings", seat(1), auth());
    expect(res.status).toBe(404);
  });
});

describe("S3 — the server decides the price", () => {
  it("ignores any price the client sends and charges the trip's own", async () => {
    const res = await jsonPost(
      base,
      "/api/payments/orders",
      // A caller trying every name for "free" they can think of.
      { ...seat(1), seatePrice: 0, price: 0, amount: "0.01" },
      auth(),
    );

    expect(res.status).toBe(201);
    const body = await readJson<any>(res);

    expect(body.priceEGP).toBe(SEAT_PRICE_EGP);
    // 300 EGP at the default rate of 48.
    expect(body.amount).toBe("6.25");
    expect(body.currency).toBe("USD");
  });

  it("holds the seat while checkout is in flight, but does not sell it", async () => {
    const { Trip } = await import("../models/Trip.js");
    const trip = await Trip.findById(tripId);
    const held = trip!.bus[0]!.seats.find((s) => s.seatNumber === 1);

    expect(held!.status).toBe(true);
    expect(held!.heldUntil).not.toBeNull();

    const { Booking } = await import("../models/Booking.js");
    const booking = await Booking.findOne({ seatNumber: 1 });
    expect(booking!.status).toBe("pending");
  });
});

describe("S3 — a booking is paid only after this server captures it", () => {
  it("refuses a capture whose amount does not match the order", async () => {
    const created = await jsonPost(base, "/api/payments/orders", seat(2), auth());
    const { orderId } = await readJson<any>(created);

    capturedAmount.value = "0.01";
    const res = await jsonPost(
      base,
      `/api/payments/orders/${orderId}/capture`,
      {},
      auth(),
    );
    capturedAmount.value = "6.25";

    expect(res.status).toBe(400);
    expect((await readJson<any>(res)).message).toBe("Payment amount mismatch");

    const { Booking } = await import("../models/Booking.js");
    const booking = await Booking.findOne({ paypalOrderId: orderId });
    expect(booking!.status).toBe("pending");
  });

  it("confirms the booking when the captured amount matches", async () => {
    const created = await jsonPost(base, "/api/payments/orders", seat(3), auth());
    const { orderId, reference } = await readJson<any>(created);

    const res = await jsonPost(
      base,
      `/api/payments/orders/${orderId}/capture`,
      {},
      auth(),
    );
    expect(res.status).toBe(200);

    const { Booking } = await import("../models/Booking.js");
    const booking = await Booking.findOne({ reference });
    expect(booking!.status).toBe("paid");
    expect(booking!.paypalCaptureId).toBeTruthy();
    expect(booking!.priceEGP).toBe(SEAT_PRICE_EGP);

    // Seat is sold: taken, and no longer on a hold that could lapse.
    const { Trip } = await import("../models/Trip.js");
    const trip = await Trip.findById(tripId);
    const sold = trip!.bus[0]!.seats.find((s) => s.seatNumber === 3);
    expect(sold!.status).toBe(true);
    expect(sold!.heldUntil).toBeNull();
  });

  it("does not issue a second ticket when a capture is replayed", async () => {
    const { Booking } = await import("../models/Booking.js");
    const booking = await Booking.findOne({ seatNumber: 3, status: "paid" });

    const res = await jsonPost(
      base,
      `/api/payments/orders/${booking!.paypalOrderId}/capture`,
      {},
      auth(),
    );

    expect(res.status).toBe(200);
    expect(await Booking.countDocuments({ seatNumber: 3, status: "paid" })).toBe(1);
  });
});

describe("S11 — a seat cannot be sold twice", () => {
  it("gives the seat to exactly one of two simultaneous requests", async () => {
    const [a, b] = await Promise.all([
      jsonPost(base, "/api/payments/orders", seat(4), auth()),
      jsonPost(base, "/api/payments/orders", seat(4), auth()),
    ]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);

    const { Booking } = await import("../models/Booking.js");
    expect(await Booking.countDocuments({ seatNumber: 4, status: "pending" })).toBe(1);
  });

  it("refuses an order for a seat that is already sold", async () => {
    const res = await jsonPost(base, "/api/payments/orders", seat(3), auth());
    expect(res.status).toBe(409);
  });
});

describe("checkout can be abandoned without losing the seat", () => {
  it("releases the hold on cancel", async () => {
    const { Trip } = await import("../models/Trip.js");
    await Trip.updateOne(
      { _id: tripId },
      { $push: { "bus.0.seats": { seatNumber: 5, status: false, heldUntil: null } } },
    );

    const created = await jsonPost(base, "/api/payments/orders", seat(5), auth());
    const { orderId } = await readJson<any>(created);

    const res = await jsonPost(
      base,
      `/api/payments/orders/${orderId}/cancel`,
      {},
      auth(),
    );
    expect(res.status).toBe(200);

    const trip = await Trip.findById(tripId);
    const released = trip!.bus[0]!.seats.find((s) => s.seatNumber === 5);
    expect(released!.status).toBe(false);
    expect(released!.heldUntil).toBeNull();
  });
});

describe("the expiry sweep frees only lapsed holds", () => {
  it("releases a seat whose hold lapsed but never a sold one", async () => {
    const { Trip } = await import("../models/Trip.js");
    const { releaseLapsedHolds } = await import("../services/seatStore.js");

    const trip = await Trip.create({
      from: "Aswan",
      to: "Qena",
      date: "2030-2-2",
      bus: [
        {
          number: "202",
          time: "09:00",
          price: 100,
          seats: [
            // sold: taken, and off the clock
            { seatNumber: 1, status: true, heldUntil: null },
            // a checkout abandoned five minutes ago
            {
              seatNumber: 2,
              status: true,
              heldUntil: new Date(Date.now() - 300_000),
            },
            { seatNumber: 3, status: false, heldUntil: null },
          ],
        },
      ],
    });

    await releaseLapsedHolds();

    const after = await Trip.findById(trip.id);
    const seats = after!.bus[0]!.seats;

    // The bug this pins down: a query using `$ne: null` on the array path
    // matches no document once any seat is unheld, so the sweep silently did
    // nothing — and a naive fix released the sold seat along with the lapsed one.
    expect(seats.find((s) => s.seatNumber === 1)!.status).toBe(true);
    expect(seats.find((s) => s.seatNumber === 2)!.status).toBe(false);
    expect(seats.find((s) => s.seatNumber === 2)!.heldUntil).toBeNull();
    expect(seats.find((s) => s.seatNumber === 3)!.status).toBe(false);
  });
});

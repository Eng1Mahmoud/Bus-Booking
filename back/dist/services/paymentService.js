import { paypal } from "../config/paypal.js";
import { Booking } from "../models/Booking.js";
import { bookingService, HOLD_MINUTES } from "./bookingService.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { sendTicket } from "../utils/mailer.js";
import { env } from "../config/env.js";
/** Seat prices are stored in EGP; PayPal is charged in PAYPAL_CURRENCY. */
const toChargeAmount = (priceEGP) => {
    if (env.PAYPAL_CURRENCY === "EGP")
        return priceEGP;
    return Math.round((priceEGP / env.EGP_TO_USD_RATE) * 100) / 100;
};
export const paymentService = {
    /**
     * Step one of checkout.
     *
     * The server picks the price, holds the seat, and creates the PayPal order.
     * The browser receives an order id and nothing else it could tamper with —
     * previously it chose the amount, approved the payment itself, and then told
     * us it had happened.
     */
    async createOrder(userId, userEmail, selection) {
        if (!paypal.isConfigured()) {
            throw new ApiError(503, "Payments are not configured on this server");
        }
        await bookingService.releaseExpiredHolds();
        const { trip, seat, price } = await bookingService.resolveSeat(selection);
        if (seat.status) {
            throw ApiError.conflict("That seat is no longer available");
        }
        const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
        const claimed = await bookingService.holdSeat(trip.id, selection.busNumber, selection.seatNumber, expiresAt);
        // Someone else's request won the race between the read above and this
        // write. They have the seat; this caller does not.
        if (!claimed) {
            throw ApiError.conflict("That seat was just taken");
        }
        const amountCharged = toChargeAmount(price);
        let booking;
        try {
            booking = await bookingService.createPending({
                userId,
                userEmail,
                trip,
                busNumber: selection.busNumber,
                seatNumber: selection.seatNumber,
                priceEGP: price,
                amountCharged,
                currency: env.PAYPAL_CURRENCY,
                expiresAt,
            });
            const order = await paypal.createOrder({
                amount: amountCharged.toFixed(2),
                currency: env.PAYPAL_CURRENCY,
                reference: booking.reference,
                description: `Tazkarty ${trip.from} to ${trip.to} on ${trip.date}, seat ${selection.seatNumber}`,
            });
            booking.paypalOrderId = order.id;
            await booking.save();
            return {
                orderId: order.id,
                bookingId: booking.id,
                reference: booking.reference,
                amount: amountCharged.toFixed(2),
                currency: env.PAYPAL_CURRENCY,
                priceEGP: price,
                expiresAt,
            };
        }
        catch (error) {
            // Never leave a seat held for an order that was never created.
            await bookingService.releaseSeat(trip.id, selection.busNumber, selection.seatNumber);
            if (booking) {
                booking.status = "cancelled";
                await booking.save();
            }
            throw error;
        }
    },
    /**
     * Step two. The only place a booking becomes `paid`.
     *
     * PayPal is asked to capture, and the captured amount and currency are then
     * checked against what this server decided to charge — a capture that came
     * back for a different sum is refused rather than honoured.
     */
    async captureOrder(userId, orderId) {
        const booking = await Booking.findOne({ paypalOrderId: orderId }).exec();
        if (!booking) {
            throw ApiError.notFound("Order not found");
        }
        // A booking belongs to the person who started it.
        if (String(booking.user) !== userId) {
            throw ApiError.forbidden("This order belongs to another account");
        }
        // Capturing twice must not produce a second ticket.
        if (booking.status === "paid") {
            return { message: "Booked successfully", booking };
        }
        if (booking.status !== "pending") {
            throw ApiError.conflict("This booking is no longer valid");
        }
        if (booking.expiresAt && booking.expiresAt.getTime() < Date.now()) {
            booking.status = "expired";
            await booking.save();
            await bookingService.releaseSeat(String(booking.trip), booking.busNumber, booking.seatNumber);
            throw ApiError.conflict("This booking expired before payment completed");
        }
        const capture = await paypal.captureOrder(orderId);
        if (capture.status !== "COMPLETED") {
            throw ApiError.badRequest("Payment was not completed");
        }
        const detail = capture.purchase_units?.[0]?.payments?.captures?.[0];
        if (!detail || detail.status !== "COMPLETED") {
            throw ApiError.badRequest("Payment was not completed");
        }
        const paid = Number(detail.amount.value);
        const expected = booking.amountCharged;
        if (detail.amount.currency_code !== booking.currency ||
            Math.abs(paid - expected) > 0.009) {
            logger.error({
                reference: booking.reference,
                expected,
                expectedCurrency: booking.currency,
                paid,
                paidCurrency: detail.amount.currency_code,
            }, "Captured amount does not match the order — refusing to confirm");
            throw ApiError.badRequest("Payment amount mismatch");
        }
        booking.status = "paid";
        booking.paypalCaptureId = detail.id;
        booking.paidAt = new Date();
        booking.expiresAt = undefined;
        await booking.save();
        await bookingService.confirmSeat(String(booking.trip), booking.busNumber, booking.seatNumber);
        await bookingService.appendToHistory(booking);
        // After the sale is recorded, so a mail outage cannot lose a paid booking.
        void sendTicket(booking.userEmail, {
            reference: booking.reference,
            from: booking.from,
            to: booking.to,
            date: booking.date,
            busNumber: booking.busNumber,
            seatNumber: booking.seatNumber,
            priceEGP: booking.priceEGP,
        });
        return { message: "Booked successfully", booking };
    },
    /** Releases the seat when the customer backs out of PayPal's checkout. */
    async cancelOrder(userId, orderId) {
        const booking = await Booking.findOne({
            paypalOrderId: orderId,
            user: userId,
            status: "pending",
        }).exec();
        if (!booking) {
            return { message: "Nothing to cancel" };
        }
        booking.status = "cancelled";
        await booking.save();
        await bookingService.releaseSeat(String(booking.trip), booking.busNumber, booking.seatNumber);
        return { message: "Booking cancelled" };
    },
};
//# sourceMappingURL=paymentService.js.map
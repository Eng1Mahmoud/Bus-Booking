import { Schema, model } from "mongoose";
const bookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, required: true },
    channel: {
        type: String,
        enum: ["online", "counter"],
        default: "online",
        required: true,
    },
    trip: { type: Schema.Types.ObjectId, ref: "trips", required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String, required: true },
    busNumber: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    priceEGP: { type: Number, required: true, min: 0 },
    amountCharged: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "cancelled", "expired"],
        default: "pending",
        index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },
    paypalOrderId: { type: String, index: true, sparse: true },
    paypalCaptureId: { type: String },
    paidAt: { type: Date },
    expiresAt: { type: Date },
}, { timestamps: true });
// One paid booking per seat, per bus, per departure. The database refuses a
// double sale even if every check above it is somehow bypassed.
bookingSchema.index({ trip: 1, busNumber: 1, seatNumber: 1 }, { unique: true, partialFilterExpression: { status: "paid" } });
export const Booking = model("Booking", bookingSchema);
export default Booking;
//# sourceMappingURL=Booking.js.map
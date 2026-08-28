import { Schema, model } from "mongoose";
const seatSchema = new Schema({
    seatNumber: { type: Number, required: true },
    status: { type: Boolean, default: false },
    // Null on free seats and on sold seats; a timestamp only while a checkout
    // is in flight. `bookingService.releaseExpiredHolds` frees anything past it.
    heldUntil: { type: Date, default: null },
}, { _id: false });
const busSchema = new Schema({
    number: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, min: 1 },
    seats: { type: [seatSchema], default: [] },
});
const tripSchema = new Schema({
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    bus: { type: [busSchema], default: [] },
}, { timestamps: true });
// Every search filters on exactly these three fields; without the index each
// one is a full collection scan.
tripSchema.index({ from: 1, to: 1, date: 1 });
export const Trip = model("trips", tripSchema);
export default Trip;
//# sourceMappingURL=Trip.js.map
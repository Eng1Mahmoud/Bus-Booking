import mongoose, { Document, Schema } from 'mongoose';

export interface ISeat {
  seatNumber: number;
  status: boolean;
}

export interface IBus {
  number: string;
  time: string;
  price: number;
  seats: ISeat[];
  capacity: number;
}

export interface ITrip {
  from: string;
  to: string;
  date: string;
  bus: IBus[];
}

export interface ITripDocument extends ITrip, Document {}

const seatSchema = new Schema<ISeat>(
  {
    seatNumber: { type: Number, required: true },
    status: { type: Boolean, required: true },
  },
  { _id: false }
);

const busSchema = new Schema<IBus>(
  {
    number: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
    seats: [seatSchema],
    capacity: { type: Number, required: true },
  },
  { _id: false }
);

const tripSchema = new Schema<ITripDocument>({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  bus: [busSchema],
});

export const TripModel = mongoose.model<ITripDocument>('trips', tripSchema);

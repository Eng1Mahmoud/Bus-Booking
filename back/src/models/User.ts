import mongoose, { Document, Schema } from 'mongoose';
import { IUser, IBooking } from '../types';

export interface IUserDocument extends IUser, Document {}

const bookingSchema = new Schema<IBooking>(
  {
    date: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    seatePrice: { type: Number, required: true },
    busNumber: { type: Number, required: true },
    seatNumber: { type: Number, required: true },
    serialBook: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>({
  FName: {
    type: String,
    required: true,
  },
  LName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  bookingsHistory: [bookingSchema],
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);

import { Trip, type TripDocument } from "../models/Trip.js";
import type { SearchTripsInput } from "../validation/tripSchemas.js";

/**
 * Services own the business logic and the database. They return data or throw
 * `ApiError`; they never touch `req` or `res`. That is what makes them
 * callable from a test without an HTTP server in front of them.
 */
export const tripService = {
  async search({ from, to, date }: SearchTripsInput): Promise<TripDocument[]> {
    // Values arrive already parsed as strings by the validate middleware, so
    // an object like `{ $ne: null }` can never reach this filter.
    return Trip.find({ from, to, date }).lean<TripDocument[]>().exec();
  },

  async listAll(): Promise<TripDocument[]> {
    return Trip.find().sort({ date: 1 }).lean<TripDocument[]>().exec();
  },
};

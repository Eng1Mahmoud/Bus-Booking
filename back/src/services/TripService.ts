import { TripModel, ITripDocument } from '../models/Trip';

export class TripService {
  async searchTrips(from: string, to: string, date: string): Promise<ITripDocument[]> {
    return await TripModel.find({
      from,
      to,
      date: { $eq: date },
    });
  }

  async bookSeat(
    from: string,
    to: string,
    date: string,
    busNumber: string,
    seatNumber: number
  ): Promise<any> {
    return await TripModel.updateOne(
      {
        from,
        to,
        date: { $eq: date },
        'bus.number': busNumber,
        'bus.seats': {
          $elemMatch: { seatNumber },
        },
      },
      {
        $set: { 'bus.$[bus].seats.$[seat].status': true },
      },
      {
        arrayFilters: [{ 'bus.number': busNumber }, { 'seat.seatNumber': seatNumber }],
      }
    );
  }

  async findAll(): Promise<ITripDocument[]> {
    return await TripModel.find();
  }

  async createTrip(tripData: any): Promise<ITripDocument> {
    const trip = new TripModel(tripData);
    return await trip.save();
  }

  async deleteTrip(id: string): Promise<ITripDocument | null> {
    return await TripModel.findByIdAndDelete(id);
  }
}

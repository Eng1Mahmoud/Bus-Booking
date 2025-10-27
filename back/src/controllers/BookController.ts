import { Response } from 'express';
import { TripService } from '../services/TripService';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/AuthMiddleware';
import { IBooking } from '../types';

export class BookController {
  private tripService: TripService;
  private userService: UserService;

  constructor() {
    this.tripService = new TripService();
    this.userService = new UserService();
  }

  book = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { from, to, date, busNumber, seatNumber, seatePrice } = req.body;
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Update trip to mark seat as booked
      await this.tripService.bookSeat(from, to, date, busNumber, seatNumber);

      // Add booking to user history
      const user = await this.userService.findByEmail(userEmail);
      if (user) {
        const booking: IBooking = {
          from,
          to,
          date,
          busNumber,
          seatNumber,
          seatePrice,
          serialBook: `${busNumber}-${seatNumber}-${Date.now()}`,
        };

        user.bookingsHistory = user.bookingsHistory || [];
        user.bookingsHistory.push(booking);
        await user.save();
      }

      res.status(200).json({ message: 'Booked successfully' });
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ message: 'Failed to book' });
    }
  };
}

import { Response } from 'express';
import { TripService } from '../services/TripService';
import { AuthRequest } from '../middleware/AuthMiddleware';

export class SearchController {
  private tripService: TripService;

  constructor() {
    this.tripService = new TripService();
  }

  search = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { from, to, date } = req.body;
      const trips = await this.tripService.searchTrips(from, to, date);
      res.status(200).json(trips);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during search' });
    }
  };
}

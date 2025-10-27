import { Response } from 'express';
import { TripService } from '../services/TripService';
import { AuthRequest } from '../middleware/AuthMiddleware';

export class TripController {
  private tripService: TripService;

  constructor() {
    this.tripService = new TripService();
  }

  getTrips = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const trips = await this.tripService.findAll();
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

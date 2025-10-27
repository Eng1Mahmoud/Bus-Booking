import { Router } from 'express';
import { TripController } from '../controllers/TripController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class TripRoutes {
  public router: Router;
  private tripController: TripController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.tripController = new TripController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/trips', this.authMiddleware.verifyToken, this.tripController.getTrips);
  }
}

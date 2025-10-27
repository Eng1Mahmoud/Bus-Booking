import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class AdminRoutes {
  public router: Router;
  private adminController: AdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.adminController = new AdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/admins/login', this.adminController.login);
    this.router.get('/admins', this.authMiddleware.verifyToken, this.adminController.getAdmins);
    this.router.post('/admins', this.authMiddleware.verifyToken, this.adminController.addAdmin);
    this.router.delete('/admins/:email', this.authMiddleware.verifyToken, this.adminController.deleteAdmin);
    this.router.post('/admins/trips', this.authMiddleware.verifyToken, this.adminController.addTrip);
    this.router.delete('/admins/trips/:from/:to/:date/:busNumber', this.authMiddleware.verifyToken, this.adminController.deleteTrip);
  }
}

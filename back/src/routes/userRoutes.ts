import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class UserRoutes {
  public router: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/SignUp', this.userController.signUp);
    this.router.post('/verification', this.userController.verification);
    this.router.post('/login', this.userController.login);
    this.router.post('/sendCodeVerification', this.userController.sendCodeVerification);
    this.router.post('/newPassword', this.userController.newPassword);

    // Protected routes
    this.router.post('/getUser', this.authMiddleware.verifyToken, this.userController.getUser);
    this.router.post('/uploadImage', this.authMiddleware.verifyToken, this.userController.uploadImage);
    this.router.post('/updateInfo', this.authMiddleware.verifyToken, this.userController.updateInfo);
    this.router.post('/changePassword', this.authMiddleware.verifyToken, this.userController.changePassword);
    this.router.get('/getAllUsers', this.authMiddleware.verifyToken, this.userController.getAllUsers);
    this.router.delete('/deleteUser/:email', this.authMiddleware.verifyToken, this.userController.deleteUser);
  }
}

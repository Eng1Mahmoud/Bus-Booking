import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class BookRoutes {
  public router: Router;
  private bookController: BookController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.bookController = new BookController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/book', this.authMiddleware.verifyToken, this.bookController.book);
  }
}

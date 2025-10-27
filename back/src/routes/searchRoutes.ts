import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';

export class SearchRoutes {
  public router: Router;
  private searchController: SearchController;

  constructor() {
    this.router = Router();
    this.searchController = new SearchController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/search', this.searchController.search);
  }
}

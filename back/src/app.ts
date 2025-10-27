import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { Database } from './config/database';
import { UserRoutes } from './routes/userRoutes';
import { SearchRoutes } from './routes/searchRoutes';
import { BookRoutes } from './routes/bookRoutes';
import { AdminRoutes } from './routes/adminRoutes';
import { TripRoutes } from './routes/tripRoutes';

dotenv.config();

export class App {
  public app: Application;
  private port: string | number;
  private database: Database;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.database = Database.getInstance();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeDatabase();
  }

  private initializeMiddleware(): void {
    // Set maximum payload size to 50MB
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    
    this.app.use(cors());
    this.app.use(express.json());
    
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true in production with HTTPS
      })
    );
  }

  private initializeRoutes(): void {
    const userRoutes = new UserRoutes();
    const searchRoutes = new SearchRoutes();
    const bookRoutes = new BookRoutes();
    const adminRoutes = new AdminRoutes();
    const tripRoutes = new TripRoutes();

    this.app.use('/', userRoutes.router);
    this.app.use('/', searchRoutes.router);
    this.app.use('/', bookRoutes.router);
    this.app.use('/', adminRoutes.router);
    this.app.use('/', tripRoutes.router);

    this.app.get('/', (_req: Request, res: Response) => {
      res.send('Hello World');
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.database.connect();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

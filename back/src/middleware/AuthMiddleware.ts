import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export class AuthMiddleware {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
  }

  verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided.' });
      return;
    }

    jwt.verify(token, this.jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'Invalid token.' });
        return;
      }

      req.user = decoded as AuthPayload;
      next();
    });
  };
}

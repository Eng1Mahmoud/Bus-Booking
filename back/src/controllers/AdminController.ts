import { Response } from 'express';
import { AdminService } from '../services/AdminService';
import { TripService } from '../services/TripService';
import { AuthRequest } from '../middleware/AuthMiddleware';

export class AdminController {
  private adminService: AdminService;
  private tripService: TripService;

  constructor() {
    this.adminService = new AdminService();
    this.tripService = new TripService();
  }

  login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const admin = await this.adminService.findByEmail(email);

      if (!admin) {
        res.json({ exist: false, message: 'Admin Not Found' });
        return;
      }

      // Note: In production, passwords should be hashed and compared using bcrypt
      if (admin.password !== password) {
        res.json({ exist: false, message: 'Password is incorrect' });
        return;
      }

      const token = this.adminService.generateToken(admin.email);
      res.json({ exist: true, message: 'Login Success', token });
    } catch (error) {
      res.json({ message: 'An error occurred' });
    }
  };

  getAdmins = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const admins = await this.adminService.findAll();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  deleteAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const count = await this.adminService.countAdmins();

      if (count <= 1) {
        const admins = await this.adminService.findAll();
        res.json({
          message:
            'This administrator cannot be deleted before you add another. The site should not become without an administrator',
          admins,
        });
        return;
      }

      const result = await this.adminService.deleteByEmail(req.params.email);

      if (!result) {
        res.json({ message: 'Admin not found' });
        return;
      }

      const admins = await this.adminService.findAll();
      res.json({ message: 'Admin deleted successfully', admins });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  addAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existingAdmin = await this.adminService.findByEmail(req.body.email);

      if (existingAdmin) {
        res.json({ message: 'Admin already exists' });
        return;
      }

      await this.adminService.createAdmin(req.body);
      res.json({ message: 'Admin added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  addTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { from, to, date, busNumber, time, capacity, priceSeat } = req.body;

      // Check if the bus number already exists in any trip
      const trips = await this.tripService.findAll();
      const busExists = trips.some((trip) =>
        trip.bus.some((bus) => bus.number === busNumber)
      );

      if (busExists) {
        res.json({
          message: 'This bus number already exists. Please choose a different bus number.',
        });
        return;
      }

      const newBus = {
        number: busNumber,
        price: priceSeat,
        time,
        seats: Array.from({ length: capacity }, (_, i) => ({
          seatNumber: i + 1,
          status: false,
        })),
        capacity,
      };

      // Find existing trip or create new one
      const existingTrips = await this.tripService.searchTrips(from, to, date);

      if (existingTrips.length > 0) {
        const trip = existingTrips[0];
        trip.bus.push(newBus);
        await trip.save();
        res.json({ message: 'Trip added successfully' });
      } else {
        await this.tripService.createTrip({
          from,
          to,
          date,
          bus: [newBus],
        });
        res.json({ message: 'Trip added successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to add the trip' });
    }
  };

  deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { from, to, date, busNumber } = req.params;

      const trips = await this.tripService.searchTrips(from, to, date);

      if (trips.length === 0) {
        res.status(404).json({ message: 'Trip not found' });
        return;
      }

      const trip = trips[0];
      trip.bus = trip.bus.filter((bus) => bus.number !== busNumber);

      if (trip.bus.length === 0) {
        await this.tripService.deleteTrip(trip._id as string);
        res.status(200).json({ message: 'Trip deleted successfully' });
      } else {
        await trip.save();
        res.status(200).json({ message: 'Bus deleted from the trip successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete the bus from the trip' });
    }
  };
}

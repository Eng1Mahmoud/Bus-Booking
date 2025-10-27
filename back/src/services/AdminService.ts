import { AdminModel, IAdminDocument } from '../models/Admin';
import jwt from 'jsonwebtoken';

export class AdminService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
  }

  async findByEmail(email: string): Promise<IAdminDocument | null> {
    return await AdminModel.findOne({ email });
  }

  async findAll(): Promise<IAdminDocument[]> {
    return await AdminModel.find();
  }

  async countAdmins(): Promise<number> {
    return await AdminModel.countDocuments();
  }

  async createAdmin(adminData: any): Promise<IAdminDocument> {
    const admin = new AdminModel(adminData);
    return await admin.save();
  }

  async deleteByEmail(email: string): Promise<IAdminDocument | null> {
    return await AdminModel.findOneAndDelete({ email });
  }

  generateToken(email: string): string {
    return jwt.sign({ email }, this.jwtSecret);
  }
}

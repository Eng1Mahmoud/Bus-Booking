import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from '../models/User';
import { IUser } from '../types';

export class UserService {
  private readonly saltRounds: number;
  private readonly jwtSecret: string;

  constructor() {
    this.saltRounds = parseInt(process.env.SALT || '10');
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ email });
  }

  async findAll(): Promise<IUserDocument[]> {
    return await UserModel.find();
  }

  async createUser(userData: IUser): Promise<IUserDocument> {
    const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);
    const user = new UserModel({
      ...userData,
      password: hashedPassword,
    });
    return await user.save();
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  generateToken(email: string): string {
    return jwt.sign({ email }, this.jwtSecret);
  }

  async updatePassword(email: string, newPassword: string): Promise<IUserDocument | null> {
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    return await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
  }

  async updateImage(email: string, imageUrl: string): Promise<IUserDocument | null> {
    return await UserModel.findOneAndUpdate(
      { email },
      { image: imageUrl },
      { new: true }
    );
  }

  async updateInfo(
    email: string,
    updates: { FName: string; LName: string; email: string }
  ): Promise<IUserDocument | null> {
    return await UserModel.findOneAndUpdate({ email }, updates, { new: true });
  }

  async deleteByEmail(email: string): Promise<any> {
    return await UserModel.findOneAndDelete({ email }).exec();
  }
}

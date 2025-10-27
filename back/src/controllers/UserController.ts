import { Response } from 'express';
import { UserService } from '../services/UserService';
import { MailService } from '../services/MailService';
import { AuthRequest } from '../middleware/AuthMiddleware';
import { IUser } from '../types';

export class UserController {
  private userService: UserService;
  private mailService: MailService;

  constructor() {
    this.userService = new UserService();
    this.mailService = new MailService();
  }

  signUp = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) {
        res.json({ exist: true, message: 'user already exists' });
        return;
      }

      const verificationCode = Math.random().toString(10).substring(2, 6);
      await this.mailService.sendVerificationCode(email, verificationCode);

      res.json({
        exist: false,
        verification_code: verificationCode,
        user: req.body,
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during sign up' });
    }
  };

  verification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { verification_code, user, verificationCode } = req.body;

      if (verificationCode !== verification_code) {
        res.json({ verification: false, message: 'كود التحقق غير صحيح' });
        return;
      }

      await this.userService.createUser(user as IUser);
      res.json({
        verification: true,
        message: 'تم انشاء الحساب بنجاح',
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during verification' });
    }
  };

  sendCodeVerification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const verificationCode = Math.random().toString(10).substring(2, 6);

      await this.mailService.sendVerificationCode(email, verificationCode);

      res.json({
        send: true,
        message: 'send verification',
        email,
        verification_code: verificationCode,
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred sending verification code' });
    }
  };

  newPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password, verificationCode, verification_code } = req.body;

      if (verificationCode !== verification_code) {
        res.json({ verification: false, message: 'Invalid verification code' });
        return;
      }

      const updatedUser = await this.userService.updatePassword(email, password);

      if (!updatedUser) {
        res.json({ verification: false, message: 'User not found' });
        return;
      }

      res.json({
        verification: true,
        message: 'Password updated',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  };

  login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.userService.findByEmail(email);

      if (!user) {
        res.json({ exist: false, message: 'User Not Found' });
        return;
      }

      const isMatch = await this.userService.verifyPassword(password, user.password);

      if (!isMatch) {
        res.json({ exist: false, message: 'Password Incorrect' });
        return;
      }

      const token = this.userService.generateToken(user.email);
      res.json({ exist: true, message: 'login success', token });
    } catch (error) {
      res.json({ message: 'An error occurred' });
    }
  };

  getUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await this.userService.findByEmail(userEmail);
      res.json({ message: 'User found', result: user });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { image } = req.body;
      const result = await this.userService.updateImage(userEmail, image);

      res.status(200).json({ message: 'Image uploaded', result });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  updateInfo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { FName, LName, email } = req.body;
      const result = await this.userService.updateInfo(userEmail, { FName, LName, email });

      res.status(200).json({ message: 'User updated', result });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { password, newPassword } = req.body;
      const user = await this.userService.findByEmail(userEmail);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const isMatch = await this.userService.verifyPassword(password, user.password);

      if (!isMatch) {
        res.json({
          result: {
            message: 'The current password you entered is incorrect',
            match: false,
          },
        });
        return;
      }

      await this.userService.updatePassword(userEmail, newPassword);
      res.status(200).json({
        result: {
          message: 'Password changed successfully',
          match: true,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      res.status(200).json({ message: 'All users', result: users });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };

  deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const result = await this.userService.deleteByEmail(email);
      res.status(200).json({ message: 'User deleted', result });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  };
}

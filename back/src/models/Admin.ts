import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin {
  name: string;
  email: string;
  password: string;
}

export interface IAdminDocument extends IAdmin, Document {}

const adminSchema = new Schema<IAdminDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const AdminModel = mongoose.model<IAdminDocument>('admins', adminSchema);

import mongoose from 'mongoose';

const admins = new mongoose.Schema({
 name: {
    type: String,
    required: true
 },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },  
});

const Admin = mongoose.model('admins', admins);

export default Admin;
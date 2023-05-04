import mongoose from 'mongoose';

const users = new mongoose.Schema({
  FName: {
    type: String,
    required: true
  },
  LName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  image:{
    type: String,
  },
  bookingsHistory:[
    {
      date:String,
      from:String,
      to:String,
      seatePrice:Number,
      busNumber:Number,
      seatNumber:Number,
      serialBook:String
    }
  ]
 
});

const User = mongoose.model('User', users);

export default User;
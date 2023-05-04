import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  bus:[
    {
        number:String,
        time:String,
        price:Number,
        seats:[
            {
                seatNumber:Number,
                status:Boolean
            }
        ],
        capacity:Number
    }
  ]
});

const Trip = mongoose.model('trips', tripSchema);

export default Trip


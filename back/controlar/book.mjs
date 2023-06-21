import Trip from "../models/trips.mjs";
import User from "../models/users.mjs";
const book = (req, res) => {
  const { from, to, date, busNumber, seatNumber, seatePrice } = req.body;
  const user = req.user;
  Trip.updateOne(
    {
      from: from,
      to: to,
      date: { $eq: date },
      "bus.number": busNumber,
      "bus.seats": {
        $elemMatch: { seatNumber: seatNumber },
      },
    },
    {
      $set: { "bus.$[bus].seats.$[seat].status": true },
    },
    {
      arrayFilters: [
        { "bus.number": busNumber },
        { "seat.seatNumber": seatNumber },
      ],
    }
  )
    .then((result) => {
      res.status(200).json({ message: "Booked successfully", result: result });
      // add booking to user history after booking
      User.updateOne(
        { email: user.email },
        {
          $push: {
            bookingsHistory: {
              from,
              to,
              date,
              busNumber,
              seatNumber,
              seatePrice,
            },
          },
        }
      )
        .then((result) => {})
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Failed to book" });
        });
    })
    .catch((err) => {
      console.log(err, "bad");
      res.status(500).json({ message: "Failed to book" });
    });
};

export default book;

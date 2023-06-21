import Admin from "../models/admins.mjs";
import Trip from "../models/trips.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const login = (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  Admin.findOne({email:email} )
    .then((admin) => {
      if (!admin) {
        console.log(admin);
        res.json({ exist: false, message: "Admin Not Found " });
      } else {
        if (admin.password !== password) {
          res.json({ exist: false, message: "Password is incorrect" });
        } else {
          const token = jwt.sign(
            { email: admin.email },
            process.env.JWT_SECRET
          );
          res.json({ exist: true, message: "Login Success", token });
        }
      }
      console.log(admin);
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "An error occurred" });
    });
};

// Fetch all Admins
export const getAdmins = (req, res) => {
  Admin.find({})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err));
};

// delete Admin

export const deleteAdmin = (req, res) => {
  Admin.countDocuments()
    .then((count) => {
      if (count <= 1) {
        // Return an error response indicating that the admin cannot be deleted
        Admin.find()
          .then((admins) => {
            res.json({
              message:
                "This administrator cannot be deleted before you add another. The site should not become without an administrator ",
              admins,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
          });
      } else {
        return Admin.findOneAndDelete({ email: req.params.email })
          .then((result) => {
            if (!result) {
              // If no admin found with the provided email, return an error response
              return res.json({ message: "Admin not found" });
            }

            // Retrieve all admins after deletion
            return Admin.find()
              .then((admins) => {
                res.json({ message: "Admin deleted successfully", admins });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Internal server error" });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    });
};


// add Admin
export const addAdmin = (req, res) => {
  Admin.findOne({ email: req.body.email }).then((result) => {
    if (result) {
      res.json({ message: "Admin already exists" });
    } else {
      const admin = new Admin(req.body);
      admin
        .save()
        .then((result) => {
          res.json({ message: "Admin added successfully" });
        })
        .catch((err) => console.log(err));
    }
  });
};

// book a seat
export const book = (req, res) => {
  const { from, to, date, busNumber, seatNumber } = req.body;
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
  ).then((result) => {
    res.status(200).json({ message: "Booked successfully", result: result });
  });
};

// delete specific bus number from trip
export const deleteTrip = (req, res) => {
  const { from, to, date, busNumber } = req.params;
  console.log(req.params);

  Trip.updateOne({ from, to, date }, { $pull: { bus: { number: busNumber } } })
    .then((result) => {
      console.log(result);

      // Find the trip object after the update operation
      Trip.findOne({ from, to, date })
        .then((trip) => {
          if (!trip || trip.bus.length === 0) {
            // Delete the entire trip object if it doesn't exist or if there are no more buses
            Trip.deleteOne({ from, to, date })
              .then(() => {
                res.status(200).json({ message: "Trip deleted successfully" });
              })
              .catch((error) => {
                res.status(500).json({ error: "Failed to delete the trip" });
              });
          } else {
            res.status(200).json({
              message: "Bus deleted from the trip successfully",
              result,
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to retrieve the trip" });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to delete the bus from the trip" });
    });
};

//add trips

export const AddTrip = (req, res) => {
  const { from, to, date, busNumber, time, capacity, priceSeat } = req.body;

  // Check if the bus number already exists
  Trip.findOne({ "bus.number": busNumber }).then((existingTrip) => {
    if (existingTrip) {
      // Bus number already exists in another trip
      res.json({ message: "This bus number already exists. Please choose a different bus number." });
    } else {
      const newBus = {
        number: busNumber,
        price: priceSeat,
        time,
        seats: Array.from({ length: capacity }, (_, i) => ({
          seatNumber: i + 1,
          status: false,
        })),
      };

      Trip.findOne({ from, to, date }).then((trip) => {
        if (trip) {
          // Trip already exists, add the new bus to the existing trip
          trip.bus.push(newBus);
          trip
            .save()
            .then(() => {
              res.json({ message: "Trip added successfully" });
            })
            .catch((err) => {
              res.status(500).json({ error: "Failed to add the trip" });
            });
        } else {
          // Trip does not exist, create a new trip with the bus
          const newTrip = new Trip({
            from,
            to,
            date,
            bus: [newBus],
          });

          newTrip
            .save()
            .then(() => {
              res.json({ message: "Trip added successfully" });
            })
            .catch((err) => {
              res.status(500).json({ error: "Failed to add the trip" });
            });
        }
      });
    }
  });
};

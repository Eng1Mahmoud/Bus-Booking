import User from "../models/users.mjs";
import sendMail from "./mailFunction.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const salat = process.env.SALT;




const SignUp = (req, res) => {
  const email = req.body.email;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.json({ exist: true, message: "user already exists" });
      } else {
        const verification_code = Math.random()
          .toString(10)
          .substring(2, 2 + 4);
        sendMail(req.body.email, "tazkarty", verification_code);
        res.json({ exist: false, verification_code: verification_code, user: req.body });
      }
    })
};




// verification code function
export const verification = (req, res) => {
  const { verification_code, user, verificationCode } = req.body
  if (verificationCode === verification_code) {
    const users = new User(user);

    bcrypt.hash(user.password, salat, (err, hash) => {
      users.password = hash;
      users.save().then((result) => {
        res.json({
          verification: true,
          message: "تم انشاء الحساب بنجاح",

        });
      });
    });
  } else {
    res.json({ verification: false, message: "كود التحقق غير صحيح" });
  }
};



// reset password
export const sendCodeVerification = (req, res) => {
  const { email } = req.body
  const verification_code = Math.random()
    .toString(10)
    .substring(2, 2 + 4);
  sendMail(email, "tazkarty", verification_code);

  res.json({ send: true, message: "send verivecation", email: email, verification_code: verification_code });

};



export const newPassword = (req, res) => {

  const { email, password, verificationCode, verification_code } = req.body

  if (verificationCode === verification_code) {
    bcrypt.hash(password, salat, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: "An error occurred" });
      }

      // Update the user's password with the hashed password
      User.findOneAndUpdate({ email }, { password: hash }, { new: true })
        .then((updatedUser) => {
          if (!updatedUser) {
            return res.json({ verification: false, message: "User not found" });
          }

          res.json({
            verification: true,
            message: "Password updated",
            user: updatedUser,
          });
        })
        .catch((error) => {
          res.status(500).json({ error: "An error occurred" });
        });
    });
  } else {
    res.json({ verification: false, message: "Invalid verification code" });
  }
};


// login function

export const login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({ exist: false, message: "User Not Found " });
      }

      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.json({ exist: false, message: "Password Incorrect" });
        }
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
        res.json({ exist: true, message: "login success", token });
      });
    })
    .catch((err) => {
      res.json({ message: "An error occurred" });
    });
};

// Fetch user data
export const getUser = (req, res) => {
  const user = req.user;
  User.findOne({ email: user.email }).then((result) => {
    res.json({ message: "User found", result });
  });
};

// uploade image user profile
export const uploadImage = (req, res) => {
  const user = req.user;
  const image = req.body.image;
  User.findOneAndUpdate(
    { email: user.email },
    { image: `${image}` },
    { new: true, upsert: true }
  ).then((result) => {

    res.status(200).json({ message: "Image uploaded", result });
  });
};
// update user informatin
export const updateInfo = (req, res) => {
  const user = req.user;
  const { FName, LName, email } = req.body;
  User.findOneAndUpdate(email, { FName, LName, email }, { new: true }).then((result) => {
    res.status(200).json({ message: "User updated", result });
  });
};

// change password
export const changePassword = (req, res) => {
  const user = req.user;
  const { password, newPassword } = req.body;
  User.findOne({ email: user.email }).then((user) => {
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res.json({ result: { message: "The current password you entered is incorrect", match: false } })
      }
      bcrypt.hash(newPassword, salat, (err, hash) => {
        user.password = hash;
        user.save().then((result) => {
          res.status(200).json({ result: { message: "Password changed successfully", match: true } })
        })
      })
    })
  })
};

// get all users
export const getAllUsers = (req, res) => {
  User.find().then((result) => {
    res.status(200).json({ message: "All users", result });
  });
};

// delete user
export const deleteUser = (req, res) => {

  User.findOneAndDelete(req.params.email).then((result) => {
    res.status(200).json({ message: "User deleted", result })
  }).catch((err) => {
  })
}
export default SignUp;

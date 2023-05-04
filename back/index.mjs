import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import sendMail from "./controlar/mailFunction.mjs";
import user from "./routes/user.mjs"
import Search from "./routes/search.mjs"
import books from "./routes/book.mjs"
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
// set maximum payload size to 50MB
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));
// user routes
user(app)
Search(app)
books(app)

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
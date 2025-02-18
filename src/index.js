import { app } from "./app.js";
import dbConnect from "./db/db.js";
import dotenv from "dotenv";
import { connectCloudinary } from "./utils/cloudinary.js";
dotenv.config({ path: "./env" });

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
  });
connectCloudinary();

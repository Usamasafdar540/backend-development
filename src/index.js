import dbConnect from "./db/db.js";
import dotenv from "dotenv";
import express from "express";
const app = express();
dotenv.config({
  path: "./env",
});
dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed", error);
  });

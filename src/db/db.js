import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
const app = express();
const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`,
  
    );

    console.log(
      `\n DB Connected Successfully DB HOST: ${connectionInstance.connection.host} `
    );
    // app.listen(process.env.PORT, () => {
    //   console.log(`app is listening to the PORT: ${process.env.PORT}`);
    // });
  } catch (error) {
    console.error("Error in connecting to the DB:", error);
    process.exit(1);
  }
};

export default dbConnect;

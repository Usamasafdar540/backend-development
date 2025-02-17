import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { urlencoded } from "express";
import router from "./routes/routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());
app.use("/", router);

export { app };

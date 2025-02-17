import express from express;
import cookieParser from "cookie-parser";
import cors from "cors"
import { urlencoded } from "express";
const app =express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("public"));
app.use(cookieParser());
export {app}
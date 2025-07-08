import express from "express";

import authRoutes from "./routes/auth.route.js";

import messageRoutes from "./routes/message.route.js";

import cors from "cors";

import { connectDB } from "./lib/db.js";

import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/imageUploaderErrorHandler.middleware.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT;

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log("server is running on " + PORT);
  connectDB();
});

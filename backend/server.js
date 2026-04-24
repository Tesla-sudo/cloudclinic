import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import vitalRoutes from "./routes/vitalRoutes.js";

import { initMQTTListener } from "./services/mqttListener.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ✅ CORS FIX (5173 FRONTEND)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/vitals", vitalRoutes);

const server = http.createServer(app);

// 🔥 SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

// init MQTT listener with socket
initMQTTListener(io);

app.get("/", (req, res) => {
  res.send("CloudClinic API Running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
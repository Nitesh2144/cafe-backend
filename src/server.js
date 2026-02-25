import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from "cors";
import connectDB from "./config/db.js";
import entryRouter from "./routes/businessRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import superAuthRoutes from "./routes/superAuthRoutes.js";
import superRoutes from "./routes/superRoutes.js";
import paymentManuallyRoutes from "./routes/payment.routes.js";
import invoiceConfigRoutes from "./routes/invoiceConfigRoutes.js"
import feedbackRoutes from "./routes/feedbackRoutes.js"
import fcmRoutes from "./routes/fcm.routes.js";
import "./cron/deleteOldOrders.js";

const app = express();
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // frontend url later restrict kar dena
  },
});

// 🔥 SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-business", (businessCode) => {
    socket.join(businessCode);
    console.log(`🏢 Joined room: ${businessCode}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// 🔥 io globally accessible
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use(
  "/food-images",
  express.static(path.join(__dirname, "../food-images"))
);
app.use("/api/invoice-config", invoiceConfigRoutes);

app.use("/api/entry", entryRouter);
app.use("/api/unit", unitRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/super/auth", superAuthRoutes);
app.use("/api/super", superRoutes);
app.use("/api/manpayment", paymentManuallyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/fcm", fcmRoutes);


app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://10.249.49.238:${PORT}`);
});

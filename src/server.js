import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import express from "express";
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
import "./cron/deleteOldOrders.js";

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


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
app.use("/api/invoice-config", invoiceConfigRoutes);

app.get("/", (req, res)=>{
    res.send("Hii Server Started Nitesh")
});


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

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});

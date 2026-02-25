import cron from "node-cron";
import Order from "../models/Order.js";

cron.schedule(
  "0 0 * * *", // 🕛 Daily at 12:00 AM
  async () => {
    try {
      console.log("⏰ Midnight order archive started");

      const before24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await Order.updateMany(
        {
          orderStatus: "COMPLETED",
          paymentStatus: "PAID",
          isArchived: { $ne: true }, // 🔥 double safety
          createdAt: { $lte: before24h },
        },
        {
          $set: { isArchived: true },
        }
      );

      console.log(`📦 Archived ${result.modifiedCount} orders`);
    } catch (err) {
      console.error("❌ Cron archive error:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

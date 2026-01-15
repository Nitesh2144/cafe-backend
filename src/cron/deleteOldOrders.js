import cron from "node-cron";
import Order from "../models/Order.js";

cron.schedule(
  "0 0 * * *", // 🕛 Daily at 12:00 AM
  async () => {
    try {
      console.log("⏰ Midnight order cleanup started");

      const before24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await Order.deleteMany({
        orderStatus: "COMPLETED",
        paymentStatus: "PAID",
        updatedAt: { $lte: before24h },
      });

      console.log(`🗑️ Deleted ${result.deletedCount} old orders`);
    } catch (err) {
      console.error("❌ Cron delete error:", err);
    }
  },
  {
    timezone: "Asia/Kolkata", // 🇮🇳 IMPORTANT
  }
);

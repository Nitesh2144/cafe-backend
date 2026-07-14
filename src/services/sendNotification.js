import admin from "../config/firebase.js";
import Business from "../models/Business.js";
import BusinessUser from "../models/BusinessUser.js";

export const sendNewOrderNotification = async (
  businessCode,
  order
) => {
  try {
    const business = await Business.findOne({
      businessCode,
    }).select("_id");

    if (!business) {
      console.log("❌ Business not found");
      return;
    }

    const users = await BusinessUser.find({
      businessId: business._id,
      isActive: true,
      fcmToken: {
        $nin: ["", null],
      },
    }).select("fcmToken");

    const tokens = [
      ...new Set(
        users
          .map((user) => user.fcmToken)
          .filter(Boolean)
      ),
    ];

    if (!tokens.length) {
      console.log("⚠️ No FCM tokens found");
      return;
    }

    const message = {
      notification: {
        title: "🛎️ New Order Received",
        body: `₹${order.totalAmount} | New order`,
      },

      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "orders",
        },
      },

      data: {
        type: "NEW_ORDER",
        orderId: order._id.toString(),
        screen: "AdminOrders",
      },

      tokens,
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    console.log(
      `🔔 FCM SENT => Success: ${response.successCount}, Failed: ${response.failureCount}`
    );
  } catch (err) {
    console.error("FCM ERROR =>", err);
  }
};
import admin from "../config/firebase.js";
import DeviceToken from "../models/DeviceToken.js";

export const sendNewOrderNotification = async (businessCode, order) => {
  const devices = await DeviceToken.find({ businessCode });
  if (!devices.length) return;

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
    tokens: devices.map(d => d.token),
  };

  try {
    await admin.messaging().sendMulticast(message);
    console.log("🔔 FCM sent");
  } catch (err) {
    console.error("FCM error:", err);
  }
};

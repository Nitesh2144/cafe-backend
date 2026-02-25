import Order from "../models/Order.js";
import { sendNewOrderNotification } from "../services/sendNotification.js";

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // 🔥 notification fire
    sendNewOrderNotification(order.businessCode, order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Order failed" });
  }
};

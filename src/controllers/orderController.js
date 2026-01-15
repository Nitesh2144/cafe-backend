import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import Business from "../models/Business.js";
import { getNextBillNumber } from "../utils/getNextBillNumber.js";

/* ===============================
   🛒 PLACE ORDER (BusinessCode)
   =============================== */
export const placeOrder = async (req, res) => {
  try {
    const { businessCode, unitCode, items } = req.body;

    if (!businessCode || !unitCode || !items || items.length === 0) {
      return res.status(400).json({
        message: "businessCode, unitCode and items are required",
      });
    }

    // 🔥 Business nikalo (unitName ke liye)
    const business = await Business.findOne({ businessCode });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const unit = business.units.find(
      u => u.unitCode === unitCode
    );

    const unitName = unit?.unitName || unitCode;

    let orderItems = [];
    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const { itemId, quantity } = items[i];

      const menuItem = await Menu.findOne({
        _id: itemId,
        businessCode,
        isAvailable: true,
      });

      if (!menuItem) {
        return res.status(404).json({
          message: "Menu item not found or unavailable",
        });
      }

      totalAmount += menuItem.price * quantity;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });
    }

    const newOrder = new Order({
      businessCode,
      unitCode,
      items: orderItems,
      totalAmount,
      customerCount: 1,
    });

    await newOrder.save();

    // 🔥 SOCKET EMIT (FIXED)
    const io = req.app.get("io");
    io.to(businessCode).emit("new-order", {
      ...newOrder.toObject(),
      unitName, // ✅ REAL NAME
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        ...newOrder.toObject(),
        unitName,
      },
    });
  } catch (error) {
    console.error("❌ Place Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getOrdersByBusiness = async (req, res) => {
  try {
    const { businessCode } = req.params;

    // 1️⃣ Business nikalo
    const business = await Business.findOne({ businessCode });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 2️⃣ Orders nikalo
    const orders = await Order.find({ businessCode })
      .sort({ createdAt: -1 })
      .lean(); // 🔥 important

    // 3️⃣ unitCode → unitName map
    const unitMap = {};
    business.units.forEach((u) => {
      unitMap[u.unitCode] = u.unitName;
    });

    // 4️⃣ Har order me unitName attach
    const ordersWithUnitName = orders.map((order) => ({
      ...order,
      unitName: unitMap[order.unitCode] || order.unitCode,
    }));

    res.json(ordersWithUnitName);
  } catch (error) {
    console.error("❌ Get Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCustomerCount = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const orders = await Order.find({ businessCode });

    const totalCustomers = orders.length; // 🔥 simple & correct

    res.json({
      businessCode,
      totalCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    // 🔥 SOCKET EMIT (CORRECT WAY)
    const io = req.app.get("io");

    io.to(order.businessCode).emit("order-status-update", {
      orderId: order._id,
      status: order.orderStatus,
        paymentStatus: order.paymentStatus,
    });

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markOrderPaid = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Bill number sirf ek baar generate ho
    if (!order.billNo) {
      order.billNo = await getNextBillNumber(order.businessCode);
    }

    order.paymentStatus = "PAID";
    await order.save();

    // 🔥 notify customer + admin
    const io = req.app.get("io");
    io.to(order.businessCode).emit("payment-updated", {
      orderId: order._id,
      paymentStatus: "PAID",
      billNo: order.billNo, // optional (frontend use kare to)
    });

    res.json({
      message: "Payment marked as PAID",
      order,
    });
  } catch (err) {
    console.error("❌ Mark Order Paid Error:", err);
    res.status(500).json({ message: "Payment update failed" });
  }
};





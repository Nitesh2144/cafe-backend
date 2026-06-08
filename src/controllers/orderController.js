import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import Business from "../models/Business.js";
import { getNextBillNumber } from "../utils/getNextBillNumber.js";

/* ===============================
   🛒 PLACE ORDER (BusinessCode)
   =============================== */
export const placeOrder = async (req, res) => {
  try {
    let { businessCode, unitCode, items, orderType } = req.body;

    // ✅ Normalize businessCode (avoid case mismatch)
    if (businessCode) {
      businessCode = String(businessCode).trim();
    }

    if (!businessCode || !unitCode || !items || items.length === 0) {
      return res.status(400).json({
        message: "businessCode, unitCode and items are required",
      });
    }

    // ✅ Find Business
    const business = await Business.findOne({
      businessCode: businessCode,
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    // ✅ Check Unit Exists
    const unit = business.units.find(
      (u) => String(u.unitCode) === String(unitCode)
    );

    if (!unit) {
      return res.status(404).json({
        message: "Invalid unitCode",
      });
    }

    const unitName = unit.unitName;

    let orderItems = [];
    let totalAmount = 0;

    // ✅ Fetch all menu items in one query (FAST + SAFE)
    const itemIds = items.map((i) => i.itemId);

    const menuItems = await Menu.find({
      _id: { $in: itemIds },
      businessCode: businessCode,
      isAvailable: true,
    });

    if (menuItems.length !== items.length) {
      return res.status(404).json({
        message: "One or more menu items not found",
      });
    }

    for (let i = 0; i < items.length; i++) {
      const { itemId, quantity, note } = items[i];

      const menuItem = menuItems.find(
        (m) => String(m._id) === String(itemId)
      );

      if (!menuItem) continue;

      totalAmount += menuItem.price * quantity;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        note: note?.trim() || "",
      });
    }

    const newOrder = new Order({
      businessCode,
      unitCode,
      orderType: orderType || "DINE_IN",
      businessName: business.businessName,
      items: orderItems,
      totalAmount,
        discount: 0,
  finalAmount: totalAmount,
      customerCount: 1,
      isOccupied: true,
    });

    await newOrder.save();

    const io = req.app.get("io");

    io.to(businessCode).emit("new-order", {
      ...newOrder.toObject(),
      unitName,
    });

    io.to(businessCode).emit("dashboard-update", {
      type: "NEW_ORDER",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: {
        ...newOrder.toObject(),
        unitName,
      },
    });

  } catch (error) {
    console.error("❌ Place Order Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
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
        displayType:
    order.orderType === "PARCEL"
      ? "PARCEL"
      : "DINE IN",
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

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = req.app.get("io");

    io.to(order.businessCode).emit("order-status-update", {
      orderId: order._id,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });

    if (status === "COMPLETED") {
      io.to(order.businessCode).emit("dashboard-update", {
        type: "ORDER_COMPLETED",
      });
    }

    res.json({
      message: "Order status updated",
      order,
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const generateBillNumber = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!order.billNo) {
      order.billNo = await getNextBillNumber(
        order.businessCode
      );
      await order.save();
    }

    res.json({
      billNo: order.billNo,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const markOrderPaid = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let updateData = {
      paymentStatus: "PAID",
    };

    // ✅ Bill number sirf ek baar generate ho
    if (!order.billNo) {
      updateData.billNo = await getNextBillNumber(order.businessCode);
    }

    // ✅ Agar completed hai to table free karo
    if (order.orderStatus === "COMPLETED") {
      updateData.isOccupied = false;
    }

    // 🔥 SAVE ki jagah direct update
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    const io = req.app.get("io");

    io.to(updatedOrder.businessCode).emit("payment-updated", {
      orderId: updatedOrder._id,
      paymentStatus: "PAID",
      billNo: updatedOrder.billNo,
    });

    io.to(updatedOrder.businessCode).emit("dashboard-update", {
      type: "PAYMENT_PAID",
    });

    res.json({
      message: "Payment marked as PAID",
      order: updatedOrder,
    });

  } catch (err) {
    console.error("❌ Mark Order Paid Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const applyDiscount = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { discount } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const discountAmount = Number(discount) || 0;

    order.discount = discountAmount;

    order.finalAmount = Math.max(
      0,
      order.totalAmount - discountAmount
    );

    await order.save();

    res.json({
      message: "Discount applied",
      order,
    });
  } catch (err) {
    console.error("Discount Error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};


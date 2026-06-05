import Order from "../models/Order.js";
import Business from "../models/Business.js";
import mongoose from "mongoose";

/* ===============================
   👤 GET BUSINESS PROFILE
   =============================== */
export const getBusinessProfile = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const business = await Business.findOne({ businessCode }).lean();

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    res.json({
      businessName: business.businessName,
      businessCode: business.businessCode,
      businessType: business.businessType,

      ownerName: business.ownerName || "",
      ownerMobile: business.ownerMobile || "",
      ownerEmail: business.ownerEmail || "",

      planType: business.planType,
      isPlanActive: business.isPlanActive,
      isTrialActive: business.isTrialActive,
      trialEndDate: business.trialEndDate,
planStartDate: business.planStartDate,
planEndDate: business.planEndDate,
      unitsCount: business.units?.length || 0,

      image: "https://i.pravatar.cc/300", // 🔥 later cloudinary se
    });
  } catch (err) {
    console.error("❌ BUSINESS PROFILE ERROR:", err);
    res.status(500).json({
      message: "Failed to load business profile",
    });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const { businessCode } = req.params;
    const { type } = req.query; // day | month

const now = new Date();

let startDate;
let endDate;

if (type === "day") {
  startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
} else {
  startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );
}

    const data = await Order.aggregate([
      {
        $match: {
          businessCode,
          orderStatus: "COMPLETED",
          paymentStatus: "PAID",
            isArchived: { $ne: true },
       createdAt: {
  $gte: startDate,
  $lt: endDate,
},
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.quantity" },
          totalAmount: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
      },
      { $sort: { totalQty: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load top products" });
  }
};

/* ===============================
   📊 DASHBOARD OVERVIEW
   =============================== */
export const getDashboardOverview = async (req, res) => {
  try {
    const { businessCode } = req.params;

    /* 🔹 PAID + COMPLETED ORDERS (FOR INCOME) */
    const orders = await Order.find({
      businessCode,
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
    });

    const totalIncome = orders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const totalOrders = orders.length;

    /* 🔹 TODAY ORDERS (PAID + COMPLETED ONLY) */
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      businessCode,
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
      createdAt: { $gte: start, $lte: end },
    });

    res.json({
      totalIncome,
      totalOrders,
      todayOrders, // 🔥 customer ki jagah ye
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard overview error" });
  }
};

/* ===============================
   💰 TODAY INCOME
   =============================== */
export const getTodayIncome = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          businessCode,
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          todayIncome: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({ todayIncome: result[0]?.todayIncome || 0 });
  } catch (err) {
    res.status(500).json({ message: "Today income error" });
  }
};


/* ===============================
   📅 MONTHLY INCOME (CURRENT MONTH)
   =============================== */
export const getMonthlyIncome = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          businessCode,
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: null,
          monthlyIncome: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({ monthlyIncome: result[0]?.monthlyIncome || 0 });
  } catch (err) {
    res.status(500).json({ message: "Monthly income error" });
  }
};


/* ===============================
   📈 LAST 7 DAYS INCOME
   =============================== */
/* ===============================
   📈 WEEKLY INCOME (MON → SUN)
   =============================== */
export const getWeeklyIncome = async (req, res) => {
  try {
    const { businessCode } = req.params;

    // 🔹 Today
    const today = new Date();

    // 🔹 ISO week: Monday = 1
    const day = today.getDay() === 0 ? 7 : today.getDay();

    // 🔹 Monday start
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);

    // 🔹 Sunday end
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 🔹 Aggregate orders
    const data = await Order.aggregate([
      {
        $match: {
          businessCode,
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          createdAt: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: { $isoDayOfWeek: "$createdAt" }, // 1 = Mon, 7 = Sun
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 🔹 Day mapping
    const days = [
      { day: "Mon", index: 1 },
      { day: "Tue", index: 2 },
      { day: "Wed", index: 3 },
      { day: "Thu", index: 4 },
      { day: "Fri", index: 5 },
      { day: "Sat", index: 6 },
      { day: "Sun", index: 7 },
    ];

    // 🔹 Fill missing days with 0
    const finalData = days.map((d) => {
      const found = data.find((x) => x._id === d.index);
      return {
        day: d.day,
        amount: found ? found.amount : 0,
      };
    });

    res.json(finalData);
  } catch (err) {
    console.error("Weekly income error:", err);
    res.status(500).json({ message: "Weekly income error" });
  }
};



/* ===============================
   🧾 RECENT ORDERS
   =============================== */
export const getRecentOrders = async (req, res) => {
  try {
    const { businessCode } = req.params;

    // 1️⃣ Business nikalo (units ke liye)
    const business = await Business.findOne({ businessCode });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 2️⃣ Orders nikalo
    const orders = await Order.find({
      businessCode,
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
        isArchived: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // 🔥 important

    // 3️⃣ unitCode → unitName map
    const unitMap = {};
    business.units.forEach((u) => {
      unitMap[u.unitCode] = u.unitName;
    });

    // 4️⃣ unitName attach karo
    const ordersWithUnitName = orders.map((order) => ({
      ...order,
      unitName: unitMap[order.unitCode] || order.unitCode,
    }));

    res.json(ordersWithUnitName);
  } catch (err) {
    console.error("Recent orders error:", err);
    res.status(500).json({ message: "Recent orders error" });
  }
};

// GET /dashboard/pending-count/:businessCode
export const getPendingOrderCount = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const count = await Order.countDocuments({
      businessCode,
      orderStatus: "PENDING",
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Pending count error" });
  }
};

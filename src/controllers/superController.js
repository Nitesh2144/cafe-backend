import mongoose from "mongoose";
import Business from "../models/Business.js";
import BusinessUser from "../models/BusinessUser.js";
import Order from "../models/Order.js";

export const topBusinessesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    // date format: YYYY-MM-DD

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // 🔥 SALES aggregation
    const sales = await Order.aggregate([
      {
        $match: {
          orderStatus: "COMPLETED",
          paymentStatus: "PAID",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$businessCode",
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // 🔥 Ranking + business info
    const result = await Promise.all(
      sales.map(async (s, index) => {
        const biz = await Business.findOne({
          businessCode: s._id,
        }).select("businessName address.city");

        return {
          rank: index + 1,
          businessCode: s._id,
          businessName: biz?.businessName || s._id,
          city: biz?.address?.city || "-",
          revenue: s.totalSales,
          orders: s.totalOrders,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Date-wise revenue error" });
  }
};


export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;

    // 🔥 Ensure ObjectId
    const bizId = new mongoose.Types.ObjectId(businessId);

    const business = await Business.findById(bizId).select("-units");

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 🔥 EXACT MATCH (THIS WAS THE BUG)
    const user = await BusinessUser.findOne({
      businessId: bizId,
    }).select("username email role");

    res.json({
      ...business.toObject(),
      loginUser: user || null,
    });
  } catch (error) {
    console.error("Business details error:", error);
    res.status(500).json({ message: "Failed to fetch business details" });
  }
};


/* ============================
   GET ALL BUSINESSES (LIST)
============================ */
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .select(
        "businessName businessCode businessType planType isPlanActive isActive address"
      )
      .sort({ createdAt: -1 });

    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch businesses",
    });
  }
};


const PLAN_PRICES = {
  FREE: 0,
  CAFE: 499,
  RESTAURANT: 999,
};

export const adminDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const businesses = await Business.find({
      isPlanActive: true,
      planType: { $ne: "FREE" },
    });

    let monthly = 0;
    let yearly = 0;
    let overall = 0;

    businesses.forEach((biz) => {
      const price = PLAN_PRICES[biz.planType] || 0;
      overall += price;

      if (biz.planStartDate >= yearStart) yearly += price;
      if (biz.planStartDate >= monthStart) monthly += price;
    });

    const totalBusinesses = await Business.countDocuments();
    const totalUsers = await BusinessUser.countDocuments();

    res.json({
      revenue: {
        monthly,
        yearly,
        overall,
      },
      totalBusinesses,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin dashboard summary error" });
  }
};

export const topBusinessesThisMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // 🔥 SALES BASED AGGREGATION
    const sales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$businessCode",
          totalSales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]);

    // 🔥 Business details join
    const result = await Promise.all(
      sales.map(async (s, index) => {
        const biz = await Business.findOne({
          businessCode: s._id,
        });

        return {
          rank: index + 1,
          businessName: biz?.businessName || s._id,
          city: biz?.address?.city || "-",
          revenue: s.totalSales,
          orders: s.orders,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Top businesses (sales) error" });
  }
};

export const revenueGraph = async (req, res) => {
  try {
    const { type, year } = req.query;

    const businesses = await Business.find({
      isPlanActive: true,
      planType: { $ne: "FREE" },
      planStartDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(Number(year) + 1, 0, 1),
      },
    });

    const result = {};

    businesses.forEach((biz) => {
      const key =
        type === "monthly"
          ? biz.planStartDate.getMonth() + 1
          : biz.planStartDate.getFullYear();

      result[key] =
        (result[key] || 0) + (PLAN_PRICES[biz.planType] || 0);
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Revenue graph error" });
  }
};

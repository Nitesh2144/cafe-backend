import express from "express";
import {
  getDashboardOverview,
  getTodayIncome,
  getMonthlyIncome,
  getWeeklyIncome,
  getRecentOrders,
  getTopSellingProducts,
  getPendingOrderCount,
  getBusinessProfile
} from "../controllers/dashboardController.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/overview/:businessCode", getDashboardOverview);
dashboardRoutes.get("/today-income/:businessCode", getTodayIncome);
dashboardRoutes.get("/monthly-income/:businessCode", getMonthlyIncome);
dashboardRoutes.get("/weekly-income/:businessCode", getWeeklyIncome);
dashboardRoutes.get("/recent-orders/:businessCode", getRecentOrders);
dashboardRoutes.get("/pending-count/:businessCode", getPendingOrderCount);
dashboardRoutes.get("/business-profile/:businessCode", getBusinessProfile);
dashboardRoutes.get(
  "/top-products/:businessCode",
  getTopSellingProducts
);

export default dashboardRoutes;

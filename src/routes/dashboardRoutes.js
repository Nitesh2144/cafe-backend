import express from "express";
import {
  getDashboardOverview,
  getTodayIncome,
  getMonthlyIncome,
  getWeeklyIncome,
  getRecentOrders,
} from "../controllers/dashboardController.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/overview/:businessCode", getDashboardOverview);
dashboardRoutes.get("/today-income/:businessCode", getTodayIncome);
dashboardRoutes.get("/monthly-income/:businessCode", getMonthlyIncome);
dashboardRoutes.get("/weekly-income/:businessCode", getWeeklyIncome);
dashboardRoutes.get("/recent-orders/:businessCode", getRecentOrders);

export default dashboardRoutes;

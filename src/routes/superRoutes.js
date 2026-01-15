import express from "express";
import {
  adminDashboardSummary,
  topBusinessesThisMonth,
  revenueGraph,
  getAllBusinesses,
  getBusinessById,
  topBusinessesByDate
} from "../controllers/superController.js";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";

const superRoutes = express.Router();

/* ================= DASHBOARD ================= */

superRoutes.get(
  "/dashboard/summary",
  verifyToken,
  isSuperAdmin,
  adminDashboardSummary
);

superRoutes.get(
  "/dashboard/top-businesses",
  verifyToken,
  isSuperAdmin,
  topBusinessesThisMonth
);

superRoutes.get(
  "/dashboard/revenue",
  verifyToken,
  isSuperAdmin,
  revenueGraph
);

/* ================= BUSINESSES ================= */

superRoutes.get(
  "/businesses",
  verifyToken,     
  isSuperAdmin,
  getAllBusinesses
);
superRoutes.get(
  "/dashboard/top-businesses-by-date",
  verifyToken,
  isSuperAdmin,
  topBusinessesByDate
);
superRoutes.get(
  "/businesses/:businessId",
  verifyToken,  
  isSuperAdmin,
  getBusinessById
);

export default superRoutes;

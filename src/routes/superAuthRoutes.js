import express from "express";
import {
  superAdminRegister,
  superAdminLogin,
  deleteBusiness
} from "../controllers/superAuthController.js";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
const superAuthRoutes = express.Router();

/**
 * 🚨 ONE-TIME SETUP ROUTE
 * Use only once OR protect after first admin
 */
superAuthRoutes.post("/register", superAdminRegister);

/**
 * 🔐 Login
 */
superAuthRoutes.post("/login", superAdminLogin);

superAuthRoutes.delete(
  "/delete/:businessId",
  verifyToken,
  isSuperAdmin,
  deleteBusiness
);
export default superAuthRoutes;

import express from "express";
import {
  superAdminRegister,
  superAdminLogin,
} from "../controllers/superAuthController.js";

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


export default superAuthRoutes;

import express from "express";
import { activatePlan, setBusinessPlanWithDate } from "../controllers/planController.js";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";

const planRoutes = express.Router();

/* 🔓 TEMP / ADMIN ONLY */
planRoutes.post("/activate", activatePlan);

planRoutes.put(
  "/businesses/:businessId/plan-with-date",
  verifyToken,
  isSuperAdmin,
  setBusinessPlanWithDate
);
export default planRoutes;

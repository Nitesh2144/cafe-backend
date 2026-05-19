import express from "express";
import { setBusinessPlanWithDate } from "../controllers/planController.js";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";

const planRoutes = express.Router();


planRoutes.put(
  "/businesses/:businessId/plan-with-date",
  verifyToken,
  isSuperAdmin,
  setBusinessPlanWithDate
);
export default planRoutes;

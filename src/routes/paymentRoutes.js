import express from "express";
import {
  createPaymentOrder,
  verifyAndActivatePlan,
    razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyAndActivatePlan);
router.post(
  "/webhook",
  express.json({ type: "*/*" }), // IMPORTANT
  razorpayWebhook
);

export default router;

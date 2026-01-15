import Razorpay from "razorpay";
import Business from "../models/Business.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = async (req, res) => {
  try {
    const { businessCode, planType } = req.body;

    const amount =
      planType === "CAFE" ? 49900 :
      planType === "RESTAURANT" ? 99900 : null;

    if (!amount) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const business = await Business.findOne({ businessCode });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${businessCode}_${Date.now()}`,
      notes: {
    businessCode,
    planType, // CAFE / RESTAURANT
  },
    });

    res.json({
      orderId: order.id,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    res.status(500).json({ message: "Payment init failed" });
  }
};


export const verifyAndActivatePlan = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      businessCode,
      planType,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const business = await Business.findOne({ businessCode });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    res.json({
      message: "Payment successful. Plan activated.",
      planEndDate: endDate,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    /* ================= VERIFY SIGNATURE ================= */
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const receivedSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.error("❌ Razorpay webhook signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    /* ================= HANDLE EVENT ================= */
    const event = req.body.event;

    // We only care about successful payments
    if (event !== "payment.captured") {
      return res.json({ status: "ignored" });
    }

    const payment = req.body.payload.payment.entity;
    const { businessCode, planType } = payment.notes || {};

    if (!businessCode || !planType) {
      console.error("❌ Missing businessCode or planType in payment notes");
      return res.json({ status: "missing-notes" });
    }

    /* ================= ACTIVATE PLAN ================= */
    const business = await Business.findOne({ businessCode });

    if (!business) {
      console.error("❌ Business not found:", businessCode);
      return res.json({ status: "business-not-found" });
    }

    // 🔁 Prevent duplicate activation
    if (business.planEndDate && new Date(business.planEndDate) > new Date()) {
      return res.json({ status: "already-active" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month validity

    business.planType = planType; // CAFE / RESTAURANT
    business.planStartDate = startDate;
    business.planEndDate = endDate;
    business.isPlanActive = true;

    await business.save();

    console.log(
      `✅ Plan activated via webhook | ${businessCode} | ${planType}`
    );

    return res.json({ status: "success" });
  } catch (error) {
    console.error("🔥 Razorpay webhook error:", error);
    return res.status(500).json({ status: "error" });
  }
};

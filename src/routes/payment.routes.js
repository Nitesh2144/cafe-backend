import express from "express";
import Payment from "../models/Payment.js";
import Business from "../models/Business.js";
import { verifyToken } from "../middleware/auth.js";
import { attachIO } from "../middleware/auth.js";

const paymentManuallyRoutes = express.Router();

const PLAN_CONFIG = {
  CAFE: {
    MONTHLY: { price: 499, months: 1 },
    YEARLY: { price: 4999, months: 12 },
  },
  RESTAURANT: {
    MONTHLY: { price: 999, months: 1 },
    YEARLY: { price: 9999, months: 12 },
  },
};

paymentManuallyRoutes.post("/generate-qr", async (req, res) => {
  const { businessCode, planType, duration = "MONTHLY" } = req.body;

  if (
    !PLAN_CONFIG[planType] ||
    !PLAN_CONFIG[planType][duration]
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan or duration",
    });
  }

  const { price } = PLAN_CONFIG[planType][duration];

  const note = `PLAN=${planType}|DURATION=${duration}|BUSINESS_CODE=${businessCode}`;

  const upiUrl =
    `upi://pay` +
    `?pa=niteshsinghtomar424@okaxis` +
    `&pn=TechShower` +
    `&am=${price}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`;

  let payment = await Payment.findOne({
    businessCode,
    planType,
    duration,
    status: "PENDING",
  });

  if (!payment) {
    payment = await Payment.create({
      businessCode,
      planType,
      duration,
      amount: price,
      note,
    });
  }

  res.json({
    success: true,
    upiUrl,
    amount: price,
    duration,
  });
});
// 🔥 Get business by code (plan info)
paymentManuallyRoutes.get("/by-code/:businessCode", verifyToken, async (req, res) => {
  try {
    const business = await Business.findOne({
      businessCode: req.params.businessCode,
    }).select("planType planStartDate planEndDate isPlanActive");

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(business);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


paymentManuallyRoutes.get("/admin/payments", async (req, res) => {
  const { status } = req.query;

  const query = status ? { status } : {};

  const payments = await Payment.find(query).sort({ createdAt: -1 });

  res.json(payments);
});



paymentManuallyRoutes.post("/admin/verify-payment", async (req, res) => {
  const { paymentId } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.status === "PAID") {
    return res.status(400).json({ message: "Already approved" });
  }

  payment.status = "PAID";
  payment.verified = true;
  await payment.save();

  const { months } =
    PLAN_CONFIG[payment.planType][payment.duration];

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  await Business.findOneAndUpdate(
    { businessCode: payment.businessCode },
    {
      planType: payment.planType,
      planStartDate: startDate,
      planEndDate: endDate,
      isPlanActive: true,
    }
  );

  res.json({
    success: true,
    message: `Plan activated (${payment.duration})`,
  });
});


paymentManuallyRoutes.post(
  "/user-paid",
  attachIO, // ✅ ADD THIS LINE
  async (req, res) => {
    const { businessCode, planType, duration } = req.body;

    const payment = await Payment.findOne({
      businessCode,
      planType,
      duration,
      status: "PENDING",
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "USER_PAID";
    await payment.save();

    // 🔥 NOW THIS WILL WORK
    req.io.emit("new-payment", {
      paymentId: payment._id,
      businessCode,
      planType,
      duration,
      amount: payment.amount,
    });

    res.json({ success: true });
  }
);



paymentManuallyRoutes.post("/admin/reject-payment", async (req, res) => {
  const { paymentId } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  payment.status = "REJECTED";
  await payment.save();

  res.json({ success: true, message: "Payment rejected" });
});


export default paymentManuallyRoutes;

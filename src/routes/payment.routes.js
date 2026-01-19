import express from "express";
import Payment from "../models/Payment.js";
import Business from "../models/Business.js";
import { verifyToken } from "../middleware/auth.js";
import { attachIO } from "../middleware/auth.js";

const paymentManuallyRoutes = express.Router();

const PLAN_CONFIG = {
  CAFE: {
    MONTHLY: { price: 499, months: 1, visible: false }, 
    HALF_YEARLY: { price: 2499, months: 6, visible: true },
    YEARLY: { price: 4999, months: 12, visible: true },
  },
  RESTAURANT: {
    MONTHLY: { price: 999, months: 1, visible: false },
    HALF_YEARLY: { price: 4999, months: 6, visible: true },
    YEARLY: { price: 9999, months: 12, visible: true },
  },
};


paymentManuallyRoutes.post("/generate-qr",  verifyToken, async (req, res) => {
  const { businessCode, businessType, planType } = req.body; // planType = HALF_YEARLY / YEARLY

  if (
    !PLAN_CONFIG[businessType] ||
    !PLAN_CONFIG[businessType][planType]
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan or duration",
    });
  }

  const { price } = PLAN_CONFIG[businessType][planType];

  const note = `BUSINESS=${businessCode}|TYPE=${businessType}|PLAN=${planType}`;

  const upiUrl =
    `upi://pay` +
    `?pa=niteshsinghtomar424@okaxis` +
    `&pn=NiteshTomar` +
    `&am=${price}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`;

// 🔥 STEP 1: Purane pending payment delete karo
await Payment.deleteMany({
  businessCode,
  businessType,
  status: "PENDING",
});

// 🔥 STEP 2: Fresh payment create karo
const payment = await Payment.create({
  businessCode,
  businessType,
  planType,
  amount: price,
  note,
});


  res.json({
    success: true,
    upiUrl,
    amount: price,
    planType,
  });
});

// 🔥 Get business by code (plan info)
paymentManuallyRoutes.get("/by-code/:businessCode", verifyToken, async (req, res) => {
  try {
    const business = await Business.findOne({
      businessCode: req.params.businessCode,
    }).select("planType planStartDate planEndDate isPlanActive isTrialActive trialStartDate trialEndDate");

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
const { months } = PLAN_CONFIG[payment.businessType][payment.planType];



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
       isTrialActive: false 
    }
  );

  res.json({
    success: true,
  message: `Plan activated (${payment.planType})`,
  });
});


paymentManuallyRoutes.post(
  "/user-paid",
  attachIO,
  async (req, res) => {
    const { businessCode, businessType, planType } = req.body;

    const payment = await Payment.findOne({
      businessCode,
      businessType,
      planType,
      status: "PENDING",
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "USER_PAID";
    await payment.save();

    req.io.emit("new-payment", {
      paymentId: payment._id,
      businessCode,
      businessType,
      planType,
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

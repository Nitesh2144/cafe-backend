import express from "express";
import InvoiceConfig from "../models/InvoiceConfig.js";
import Business from "../models/Business.js";
import Order from "../models/Order.js";
const invoiceConfigRoutes = express.Router();

/* ================= GET CONFIG ================= */
invoiceConfigRoutes.get("/:businessCode", async (req, res) => {
  try {
    const { businessCode } = req.params;

    // 1️⃣ Invoice Config
    const config = await InvoiceConfig.findOne({ businessCode });
   // 2️⃣ Business Name
    const business = await Business.findOne({ businessCode }).select(
      "businessName"
    );

    // 3️⃣ Last Bill No (for display / print)
    const lastOrder = await Order.findOne({ businessCode })
      .sort({ createdAt: -1 })
      .select("billNo");

    res.json({
      ...(config?.toObject() || {}),
      businessName: business?.businessName || "",
      billNo: lastOrder?.billNo || "",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load config" });
  }
});

/* ================= SAVE / UPDATE CONFIG ================= */
invoiceConfigRoutes.put("/:businessCode", async (req, res) => {
  try {
    const config = await InvoiceConfig.findOneAndUpdate(
      { businessCode: req.params.businessCode },
      { $set: req.body },                 // ✅ ONLY UPDATE DATA
      {
        new: true,
        upsert: true,                     // ✅ create if not exists
        runValidators: true,              // ✅ schema validation
      }
    );

    res.json(config);
  } catch (err) {
    console.error("❌ Save invoice config error:", err);
    res.status(500).json({ message: "Failed to save config" });
  }
});

export default invoiceConfigRoutes;

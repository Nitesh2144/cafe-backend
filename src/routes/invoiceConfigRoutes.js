import express from "express";
import InvoiceConfig from "../models/InvoiceConfig.js";

const invoiceConfigRoutes = express.Router();

/* ================= GET CONFIG ================= */
invoiceConfigRoutes.get("/:businessCode", async (req, res) => {
  try {
    const config = await InvoiceConfig.findOne({
      businessCode: req.params.businessCode,
    });

    res.json(config);
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

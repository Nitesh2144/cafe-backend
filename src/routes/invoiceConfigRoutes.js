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
    const {
      logoUrl,
      themeColor,
      showGST,
      gstPercent,
      showPaymentStatus,
      showOrderTime,
      showUnitName,
      invoicePrefix,
      footerText,
      fontSize,
      paperSize,
      businessPhone,
      businessAddress, 
    } = req.body;

    const config = await InvoiceConfig.findOneAndUpdate(
      { businessCode: req.params.businessCode },
      {
        logoUrl,
        themeColor,
        showGST,
        gstPercent,
        showPaymentStatus,
        showOrderTime,
        showUnitName,
        invoicePrefix,
        footerText,
        fontSize,
        paperSize,
        businessPhone,
        businessAddress, 
      },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to save config" });
  }
});

export default invoiceConfigRoutes;

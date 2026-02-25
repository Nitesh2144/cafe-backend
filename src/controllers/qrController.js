import QRCode from "qrcode";
import Business from "../models/Business.js";

export const generateUnitQR = async (req, res) => {
  try {
    const { businessId, unitCode } = req.query;

    if (!businessId || !unitCode) {
      return res.status(400).json({
        message: "businessId and unitCode are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const unit = business.units.find(
      (u) => u.unitCode === unitCode
    );
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // 🔒 If QR already exists → return saved one
    if (unit.qrImage && unit.qrUrl) {
      return res.json({
        message: "QR already generated",
        qrUrl: unit.qrUrl,
        qrImage: unit.qrImage,
      });
    }

    // 🔗 QR URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const qrUrl = `${baseUrl}/?b=${business.businessCode}&u=${unit.unitCode}`;

    // 🎨 Generate QR
    const qrImage = await QRCode.toDataURL(qrUrl);

    // 💾 SAVE TO DATABASE
    unit.qrUrl = qrUrl;
    unit.qrImage = qrImage;

    await business.save();

    res.json({
      message: "QR generated and saved",
      qrUrl,
      qrImage,
    });
  } catch (error) {
    console.error("❌ QR error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const generateAllQR = async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: "businessId required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const qrList = [];

    for (let unit of business.units) {
      const qrUrl = `${baseUrl}/?b=${business.businessCode}&u=${unit.unitCode}`;

      const qrImage = await QRCode.toDataURL(qrUrl);

      unit.qrUrl = qrUrl;
      unit.qrImage = qrImage;

      qrList.push({
        unitName: unit.unitName,
        unitCode: unit.unitCode,
        qrImage,
      });
    }

    await business.save();

    res.json(qrList);
  } catch (error) {
    console.error("❌ Generate All QR Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

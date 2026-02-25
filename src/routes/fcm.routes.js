import express from "express";
import DeviceToken from "../models/DeviceToken.js";

const router = express.Router();

router.post("/save-token", async (req, res) => {
  try {
    const { token, businessCode, platform } = req.body;

    if (!token || !businessCode) {
      return res.status(400).json({ message: "token & businessCode required" });
    }

    await DeviceToken.findOneAndUpdate(
      { token },
      { token, businessCode, platform },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("FCM save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

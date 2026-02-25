import Feedback from "../models/Feedback.js";
import Business from "../models/Business.js";
import Order from "../models/Order.js";

export const submitFeedback = async (req, res) => {
  try {
    const { businessCode, orderId, rating, message } = req.body;

    if (!businessCode || !orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* 🔎 Business check */
    const business = await Business.findOne({
  businessCode: businessCode.toUpperCase(),
      isActive: true,
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (!business.feedbackSettings.enableFeedback) {
      return res.status(403).json({ message: "Feedback disabled by business" });
    }

    /* 🔎 Order check */
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

  const exists = await Feedback.findOne({ orderId });


    /* 🔍 Order completion check */
    const isAfterCompletion =
      order.orderStatus === "COMPLETED" &&
      order.paymentStatus === "PAID";

    /* ❌ Early feedback permission */
    if (
      !isAfterCompletion &&
      !business.feedbackSettings.allowBeforeCompletion
    ) {
      return res
        .status(403)
        .json({ message: "Early feedback not allowed" });
    }

    /* ⭐ Rating validation */
    if (isAfterCompletion && !rating) {
      return res.status(400).json({ message: "Rating required" });
    }

let feedback;
if (exists) {
  // 🔒 Final feedback already done → block
  if (exists.isAfterCompletion) {
    return res
      .status(400)
      .json({ message: "Final feedback already submitted" });
  }

  // ✅ Order completed → ALWAYS update rating
  if (isAfterCompletion) {
    if (!rating) {
      return res
        .status(400)
        .json({ message: "Rating required for final feedback" });
    }

    feedback = await Feedback.findByIdAndUpdate(
      exists._id,
      {
        rating: Number(rating),
        message,
        isAfterCompletion: true,
      },
      { new: true }
    );
  } else {
    // ❌ Early feedback again not allowed
    return res
      .status(400)
      .json({ message: "Early feedback already submitted" });
  }
} else {
  // 🆕 CREATE feedback (EARLY feedback)
  feedback = await Feedback.create({
    businessCode,
    orderId,
   rating: isAfterCompletion ? Number(rating) : null,
    message,
    isAfterCompletion: false,
  });
}


    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeedbackByBusiness = async (req, res) => {
  try {
    const { businessCode } = req.params;

    const feedbacks = await Feedback.find({ businessCode })
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
/* ================= UPDATE FEEDBACK SETTINGS ================= */
export const updateFeedbackSettings = async (req, res) => {
  try {
    const {
      businessCode,
      enableFeedback,
      allowBeforeCompletion,
    } = req.body;

    if (!businessCode) {
      return res.status(400).json({ message: "businessCode required" });
    }

const business = await Business.findOne({
  businessCode: businessCode.toUpperCase(),
});


    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // ✅ Update only provided fields
    if (typeof enableFeedback === "boolean") {
      business.feedbackSettings.enableFeedback = enableFeedback;

      // 🔒 agar feedback OFF kiya to early bhi OFF
      if (!enableFeedback) {
        business.feedbackSettings.allowBeforeCompletion = false;
      }
    }

    if (
      typeof allowBeforeCompletion === "boolean" &&
      business.feedbackSettings.enableFeedback
    ) {
      business.feedbackSettings.allowBeforeCompletion =
        allowBeforeCompletion;
    }

    await business.save();

    res.json({
      success: true,
      message: "Feedback settings updated",
      feedbackSettings: business.feedbackSettings,
    });
  } catch (error) {
    console.error("Feedback settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


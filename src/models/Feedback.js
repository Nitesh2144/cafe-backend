import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    businessCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // 🔒 ek order = ek feedback
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // early feedback ke liye
    },

    message: {
      type: String,
      trim: true,
    },

    isAfterCompletion: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);

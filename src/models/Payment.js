import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    businessCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    businessType: {
      type: String,
      enum: ["CAFE", "RESTAURANT"],
      required: true,
    },
    amount: { type: Number, required: true },

     planType: {
      type: String,
      enum: ["HALF_YEARLY", "YEARLY"],
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "UPI_MANUAL",
    },

    note: { type: String }, // BUSINESS_CODE=ABC123|PLAN=CAFE

  status: {
  type: String,
  enum: ["PENDING", "USER_PAID", "PAID", "REJECTED"],
  default: "PENDING",
},

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

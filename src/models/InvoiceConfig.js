import mongoose from "mongoose";

const invoiceConfigSchema = new mongoose.Schema(
  {
    businessCode: {
      type: String,
      required: true,
      unique: true,
    },

    logoUrl: {
      type: String,
      default: "",
    },

    businessPhone: {
      type: String,
      default: "",
    },

    // ✅ BUSINESS ADDRESS
    businessAddress: {
      street: { type: String, default: "" },
      area: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    themeColor: {
      type: String,
      default: "#6c5ce7",
    },

    showGST: {
      type: Boolean,
      default: true,
    },

    gstPercent: {
      type: Number,
      default: 5,
    },

    showPaymentStatus: {
      type: Boolean,
      default: true,
    },

    showOrderTime: {
      type: Boolean,
      default: true,
    },

    showUnitName: {
      type: Boolean,
      default: true,
    },

    invoicePrefix: {
      type: String,
      default: "INV-",
    },

    footerText: {
      type: String,
      default: "Thank you for your visit!",
    },

    fontSize: {
      type: Number,
      default: 10,
    },

    paperSize: {
      type: String,
      enum: ["A4", "80mm", "58mm"],
      default: "A4",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InvoiceConfig", invoiceConfigSchema);

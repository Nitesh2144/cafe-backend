import mongoose from "mongoose";
import crypto from "crypto";
/* ================= UNIT SUB-SCHEMA ================= */


const unitSchema = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: true,
    },

 unitCode: {
  type: String,
  immutable: true,
  default: () =>
    crypto.randomBytes(8).toString("hex"),
},

    unitType: {
      type: String,
      enum: ["Table", "Room", "Counter", "ONLINE"],
      default: "Table",
    },

    capacity: {
      type: Number,
      default: 1,
    },

    qrUrl: String,
    qrImage: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

/* ================= BUSINESS SCHEMA ================= */
const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },

businessCode: {
  type: String,
  unique: true,
  immutable: true,
  uppercase: true,
  default: () =>
    `BIZ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
},

    businessType: {
      type: String,
      enum: ["CAFE", "RESTAURANT"],
      required: true,
    },


    ownerName: String,
    ownerMobile: String,
    ownerEmail: String,

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    units: [unitSchema],

    orderSettings: {
      enableItemNote: {
        type: Boolean,
        default: false, // 👈 ADMIN CONTROL
      },
    },

    feedbackSettings: {
      enableFeedback: { type: Boolean, default: false },
      allowBeforeCompletion: { type: Boolean, default: false }
    },

    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },
    isTrialActive: { type: Boolean, default: true },
    trialStartDate: {
      type: Date,
    },
    
    trialEndDate: { type: Date },
    planType: {
      type: String,
      enum: ["FREE", "HALF_YEARLY", "YEARLY"],
      default: "FREE",
    },


    planStartDate: {
      type: Date,
    },

    planEndDate: {
      type: Date,
    },

    isPlanActive: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);

import mongoose from "mongoose";

/* ================= UNIT SUB-SCHEMA ================= */
const unitSchema = new mongoose.Schema(
  {
    unitName: { type: String, required: true },
    unitCode: { type: String, required: true },
    unitType: {
      type: String,
           enum: ["Table", "Room", "Counter"],
      default: "Table",
    },
    capacity: { type: Number, default: 1 },
     qrUrl: { type: String },
    qrImage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

/* ================= BUSINESS SCHEMA ================= */
const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },

    businessCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    businessType: { type: String, default: "CAFE" },

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

    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },

 planType: {
  type: String,
  enum: ["FREE", "CAFE", "RESTAURANT"],
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

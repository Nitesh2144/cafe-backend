import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
 businessCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    radius: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Location", locationSchema);
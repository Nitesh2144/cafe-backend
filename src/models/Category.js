import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: String,
      enum: ["SUPER_ADMIN", "BUSINESS"],
      default: "SUPER_ADMIN",
    },
  },
  { timestamps: true }
);

// Prevent duplicate category name
categorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);

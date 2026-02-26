import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    createdBy: {
      type: String,
      enum: ["SUPER_ADMIN", "BUSINESS"],
      default: "SUPER_ADMIN",
    },
  },
  { timestamps: true }
);

// Prevent duplicate in same category
subCategorySchema.index(
  { name: 1, categoryId: 1 },
  { unique: true }
);

export default mongoose.model("SubCategory", subCategorySchema);

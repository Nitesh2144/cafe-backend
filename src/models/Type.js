import mongoose from "mongoose";

const typeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    createdBy: {
      type: String,
      enum: ["SUPER_ADMIN", "BUSINESS"],
      default: "SUPER_ADMIN",
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

typeSchema.index(
  { name: 1, subCategoryId: 1 },
  { unique: true }
);

export default mongoose.model("Type", typeSchema);

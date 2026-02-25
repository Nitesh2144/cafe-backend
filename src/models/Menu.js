import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    businessCode: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

   categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },

    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
    },

    // 🔁 OLD SUPPORT (optional, safe)
    category: {
      type: String,
    },
    image: {
      type: String, // image url (optional)
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);

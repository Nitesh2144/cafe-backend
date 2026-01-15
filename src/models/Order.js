import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    businessCode: {
      type: String,
      required: true,
      index: true,
    },

    unitCode: {
      type: String,
      required: true,
    },

    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },
paymentStatus: {
  type: String,
  enum: ["UNPAID", "PAID"],
  default: "UNPAID",
},
billNo: {
  type: Number,
},

    customerCount: {
      type: Number,
      default: 1, 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

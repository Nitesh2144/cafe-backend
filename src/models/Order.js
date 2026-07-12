import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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
customer: {
  name: String,
  phone: String,
  address: String,
  latitude: Number,
  longitude: Number,
},
    unitCode: {
      type: String,
      required: true,
            index: true,
    },
   orderType: {
      type: String,
      enum: ["DINE_IN", "PARCEL", "ONLINE"],
      default: "DINE_IN",
      index: true,
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
       quantity: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
  type: Number,
  default: 0,
},

finalAmount: {
  type: Number,
  default: 0,
},
isOccupied: {
  type: Boolean,
  default: false,
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
isArchived: {
  type: Boolean,
  default: false,
  index: true,
},
    businessName: {
      type: String,
      required: true,
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

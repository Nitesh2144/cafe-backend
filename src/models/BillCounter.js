import mongoose from "mongoose";

const billCounterSchema = new mongoose.Schema({
  businessCode: {
    type: String,
    required: true,
    unique: true,
  },
  lastBillNo: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("BillCounter", billCounterSchema);

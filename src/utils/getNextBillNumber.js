import BillCounter from "../models/BillCounter.js";

export const getNextBillNumber = async (businessCode) => {
  const counter = await BillCounter.findOneAndUpdate(
    { businessCode },
    { $inc: { lastBillNo: 1 } },
    { new: true, upsert: true }
  );

  return counter.lastBillNo;
};

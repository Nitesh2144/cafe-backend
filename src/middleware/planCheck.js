import Business from "../models/Business.js";
import { isPlanValid } from "../utils/planUtils.js";
const planCheckMiddleware = async (req, res, next) => {
  const { businessCode } = req.params;

  const business = await Business.findOne({ businessCode });

  if (!business) {
    return res.status(404).json({ message: "Business not found" });
  }

if (business.isTrialActive && business.trialEndDate) {
  if (new Date() <= business.trialEndDate) {
    req.business = business;
    return next();
  } else {
    // 🔥 Trial expired → update DB
    business.isTrialActive = false;
    await business.save();
  }
}


  // ✅ Allow during active paid plan
  if (business.isPlanActive && business.planEndDate) {
    if (new Date() <= business.planEndDate) {
      req.business = business;
      return next();
    }
  }

  return res.status(403).json({
    planExpired: true,
    message: "Plan expired. Please renew to accept orders.",
  });
};



export default planCheckMiddleware;

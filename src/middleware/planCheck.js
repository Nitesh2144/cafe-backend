import Business from "../models/Business.js";

const planCheckMiddleware = async (
  req,
  res,
  next
) => {

  const { businessCode } = req.params;

  const business = await Business.findOne({
    businessCode,
  });

  if (!business) {
    return res.status(404).json({
      message: "Business not found",
    });
  }

  // ✅ TRIAL CHECK
  if (
    business.isTrialActive &&
    business.trialEndDate
  ) {

    if (new Date() <= business.trialEndDate) {
      req.business = business;
      return next();
    }

    // 🔥 Trial expired
    business.isTrialActive = false;

    await business.save();
  }

  // ✅ PAID PLAN CHECK
  if (
    business.isPlanActive &&
    business.planEndDate
  ) {

    if (new Date() <= business.planEndDate) {
      req.business = business;
      return next();
    }

    // 🔥 Plan expired
    business.isPlanActive = false;

    await business.save();
  }

  return res.status(403).json({
    planExpired: true,
    message:
      "Plan expired. Please renew to accept orders.",
  });
};

export default planCheckMiddleware;
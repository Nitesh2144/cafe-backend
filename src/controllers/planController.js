import Business from "../models/Business.js";

export const setBusinessPlanWithDate = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { planType, startDate, endDate } = req.body;

    if (!planType || !startDate || !endDate) {
      return res.status(400).json({
        message: "Plan type, start date and end date are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    business.planType = planType;
    business.planStartDate = new Date(startDate);
    business.planEndDate = new Date(endDate);
    business.isPlanActive = true;

    await business.save();

    res.json({
      message: "Plan activated with date range",
      business,
    });
  } catch (err) {
    res.status(500).json({ message: "Plan activation failed" });
  }
};

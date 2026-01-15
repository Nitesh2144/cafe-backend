import Business from "../models/Business.js";

export const activatePlan = async (req, res) => {
  try {
    const { businessCode, planType } = req.body;

    if (!businessCode || !planType) {
      return res.status(400).json({
        message: "businessCode and planType required",
      });
    }

    if (!["CAFE", "RESTAURANT"].includes(planType)) {
      return res.status(400).json({
        message: "Invalid plan type",
      });
    }

    const business = await Business.findOne({ businessCode });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 🔁 1 month plan

    business.planType = planType;
    business.planStartDate = startDate;
    business.planEndDate = endDate;
    business.isPlanActive = true;

    await business.save();

    res.json({
      message: "Plan activated successfully",
      planType,
      planEndDate: endDate,
    });
  } catch (error) {
    console.error("Activate plan error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

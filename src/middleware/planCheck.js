import Business from "../models/Business.js";
import { isPlanValid } from "../utils/planUtils.js";

const planCheckMiddleware = async (req, res, next) => {
  const { businessCode } = req.params;

  const business = await Business.findOne({ businessCode });

  if (!business) {
    return res.status(404).json({ message: "Business not found" });
  }

  if (!isPlanValid(business)) {
    return res.status(403).json({
      planExpired: true,
      message: "Plan expired. Please renew to accept orders.",
    });
  }

  next();
};

export default planCheckMiddleware;

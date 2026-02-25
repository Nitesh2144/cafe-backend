import Business from "../models/Business.js";
import Order from "../models/Order.js"
/* ================= ADD UNIT ================= */
export const addUnit = async (req, res) => {
  try {
    const { businessId, unitName, unitCode, unitType, capacity } = req.body;

    if (!businessId || !unitName || !unitCode) {
      return res.status(400).json({
        message: "businessId, unitName and unitCode are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // duplicate unitCode check
    const exists = business.units.find(
      (u) => u.unitCode === unitCode
    );
    if (exists) {
      return res.status(400).json({
        message: "Unit code already exists",
      });
    }

const newUnit = {
  unitName,
  unitCode,
  unitType,
  capacity,
};

business.units.push(newUnit);
await business.save();

// 🔥 get last inserted subdocument
const addedUnit = business.units[business.units.length - 1];

    res.status(201).json({
      message: "Unit added successfully",
   unit: addedUnit,
    });
  } catch (error) {
    console.error("❌ Add unit error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= EDIT UNIT ================= */
export const editUnit = async (req, res) => {
  try {
    const { businessId, unitId, unitName, unitType, capacity } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const unit = business.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (unitName) unit.unitName = unitName;
    if (unitType) unit.unitType = unitType;
    if (capacity !== undefined) unit.capacity = capacity;

    await business.save();

    res.json({
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("❌ Edit unit error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE UNIT ================= */
export const deleteUnit = async (req, res) => {
  try {
    const { businessId, unitId } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const unit = business.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    unit.deleteOne(); // subdocument delete
    await business.save();

    res.json({
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete unit error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET UNITS ================= */
export const getUnits = async (req, res) => {
  try {
    const { businessId, businessCode } = req.query;

    let business;
    if (businessId) {
      business = await Business.findById(businessId);
    } else if (businessCode) {
      business = await Business.findOne({ businessCode });
    }

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 🔥 STEP 1: Active orders nikalo
const activeOrders = await Order.find({
  businessCode: business.businessCode,
  orderType: "DINE_IN",
  paymentStatus: "UNPAID",
  orderStatus: { $in: ["PENDING", "APPROVED"] },
}).lean();

    

    // 🔥 STEP 2: Occupied unitCode set
    const occupiedUnits = new Set(
      activeOrders.map(o => o.unitCode)
    );

    // 🔥 STEP 3: units ke sath isOccupied attach karo
    const unitsWithStatus = business.units.map(u => ({
      ...u.toObject(),
      isOccupied: occupiedUnits.has(u.unitCode),
    }));

    res.json(unitsWithStatus);
  } catch (error) {
    console.error("❌ Get Units Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


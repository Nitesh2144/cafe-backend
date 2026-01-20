import Business from "../models/Business.js";

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

    business.units.push({
      unitName,
      unitCode,
      unitType,
      capacity,
    });

    await business.save();

    res.status(201).json({
      message: "Unit added successfully",
      units: business.units,
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

    res.json(business.units);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


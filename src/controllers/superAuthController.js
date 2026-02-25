import SuperAdmin from "../models/SuperAdmin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js"
import Menu from "../models/Menu.js";
import Business from "../models/Business.js"
import BusinessUser from "../models/BusinessUser.js"
export const superAdminLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const admin = await SuperAdmin.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "SUPER_ADMIN",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Super admin login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
};

export const superAdminRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    // ❌ Check if already exists
    const exists = await SuperAdmin.findOne({
      $or: [{ username }, { email }],
    });

    if (exists) {
      return res.status(409).json({
        message: "Super admin already exists",
      });
    }

    // 🔐 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create super admin
    const admin = await SuperAdmin.create({
      username,
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    });

    res.status(201).json({
      message: "Super admin registered successfully",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Super admin registration error",
    });
  }
};


/* ================= DELETE BUSINESS (FULL WIPE) ================= */
export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    // 🔐 ONLY ADMIN ALLOWED
if (req.user.role !== "SUPER_ADMIN") {
  return res.status(403).json({ message: "Unauthorized" });
}


    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // 🔥 DELETE EVERYTHING RELATED
    await Promise.all([
      BusinessUser.deleteMany({ businessId }),
      Order.deleteMany({ businessCode: business.businessCode }),
      Menu.deleteMany({ businessCode: business.businessCode }),
      Business.findByIdAndDelete(businessId),
    ]);

    res.json({
      message: "Business and all related data deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete business error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
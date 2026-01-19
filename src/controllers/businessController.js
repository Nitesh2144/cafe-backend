import Business from "../models/Business.js";
import BusinessUser from "../models/BusinessUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const resetStaffPassword = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const staff = await BusinessUser.findOne({
      _id: staffId,
      businessId: req.user.businessId,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    staff.password = hashedPassword;
    await staff.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await BusinessUser.findOneAndDelete({
      _id: staffId,
      businessId: req.user.businessId,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginBusinessUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier = username OR email

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    // 🔍 Find user by username OR email
    const user = await BusinessUser.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).populate("businessId");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // 🔐 Password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🎫 Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        businessId: user.businessId._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        business: {
          id: user.businessId._id,
          name: user.businessId.businessName,
          code: user.businessId.businessCode,
          type: user.businessId.businessType,
          
        },
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= REGISTER BUSINESS + ADMIN USER ================= */
export const registerBusinessWithUser = async (req, res) => {
  try {
    const {
      // business
      businessName,
      businessCode,
      businessType,
      ownerName,
      ownerMobile,
      ownerEmail,
      address,
      planType,

      // user
      username,
      email,
      password,
    } = req.body;

    if (
      !businessName ||
      !businessCode ||
      !ownerName ||
      !ownerMobile ||
      !ownerEmail ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All required fields are mandatory",
      });
    }

    // unique business
    const businessExists = await Business.findOne({ businessCode });
    if (businessExists) {
      return res.status(400).json({
        message: "Business code already exists",
      });
    }

    // unique user
    const userExists = await BusinessUser.findOne({
      $or: [{ username }, { email }],
    });
    if (userExists) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }
const start = new Date();
const trialEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + 8);

    // create business (units empty)
    const business = await Business.create({
      businessName,
      businessCode,
      businessType,
      ownerName,
      ownerMobile,
      ownerEmail,
      address,
       isTrialActive: true,
        trialStartDate:start,
  trialEndDate: trialEnd,
    isPlanActive: false
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const businessUser = await BusinessUser.create({
      businessId: business._id,
      username,
      email,
      password: hashedPassword,
       role: "admin",
    });
// 🔐 CREATE JWT TOKEN (ADMIN AUTO LOGIN)
const token = jwt.sign(
  {
    userId: businessUser._id,
    role: "admin",
    businessId: business._id,
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES }
);

    res.status(201).json({
      message: "Business & admin user registered successfully",
       token,
      businessId: business._id,
      adminUser: {
        id: businessUser._id,
        username: businessUser.username,
        email: businessUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listStaff = async (req, res) => {
  try {
    const staff = await BusinessUser.find({
      businessId: req.user.businessId,
      role: "staff",
    }).select("username email role");

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await BusinessUser.create({
      businessId: req.user.businessId, // 🔥 SAME BUSINESS
      username,
      email,
      password: hashedPassword,
      role: "staff",
    });

    res.status(201).json({
      message: "Staff created successfully",
      staffId: staff._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 must contain role
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Access denied. Super admin only.",
    });
  }
  next();
};

/* ================= PROTECT MIDDLEWARE ================= */

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const onlyAdmin = (req, res, next) => {
  if (!["admin", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};


export const attachIO = (req, res, next) => {
  req.io = req.app.get("io"); // 👈 yahin magic hai
  next();
};

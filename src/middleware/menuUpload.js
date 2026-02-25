import multer from "multer";

const storage = multer.memoryStorage();   // 🔥 MUST BE memoryStorage

export const menuUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional 5MB limit
});

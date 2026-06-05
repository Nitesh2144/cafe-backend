import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Type from "../models/Type.js";
import SubCategory from "../models/SubCategory.js";

// ✅ ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  addMenuItem,
  getMenuByBusinessCode,
  updateMenuItem,
  deleteMenuItem,
  getMenuByBusinessId,
  addCategory,
    getBusinessSettings,
  updateOrderSettings,
  addSubCategory,
  getSubCategories,
  addType,
  getTypes,
  getAllCategoriesForSuperAdmin,
  updateType, 
  deleteType,
  deleteCategory,
  deleteSubCategory,
  getUsedCategoriesByBusinessCode,
  searchMenuPath
} from "../controllers/menuController.js";
import { menuUpload } from "../middleware/menuUpload.js";
import { typeUpload } from "../middleware/typeUpload.js";
const menuRoutes = express.Router();

// POST /generate-image
menuRoutes.post("/generate-image", async (req, res) => {
  try {
    const { typeId, subCategoryId } = req.body;

    let images = [];

    // 🔹 1️⃣ Try Type
    if (typeId) {
      const type = await Type.findById(typeId);
      if (type?.images?.length) {
       images = type.images.map(img => img.url);
      }
    }

    // 🔹 2️⃣ Fallback SubCategory
    if (!images.length && subCategoryId) {
      const sub = await SubCategory.findById(subCategoryId);
      if (sub?.images?.length) {
        images = sub.images;
      }
    }

    // 🔹 3️⃣ Final fallback (default image)
    if (!images.length) {
      return res.json({
        imageUrl:
          "https://via.placeholder.com/300x300.png?text=Food+Image",
      });
    }

    const random =
      images[Math.floor(Math.random() * images.length)];

    res.json({ imageUrl: random });

  } catch (error) {
    console.error("Generate image error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



menuRoutes.delete("/category/:categoryId", deleteCategory);
menuRoutes.post("/add/categorie", addCategory );
menuRoutes.post("/subcategory", addSubCategory);
menuRoutes.delete("/subcategory/:id", deleteSubCategory);
menuRoutes.get(
  "/subcategories/:categoryId",
  getSubCategories
);
menuRoutes.post(
  "/type",
  typeUpload.array("images", 10), // 🔥 multiple images
  addType
);
menuRoutes.get("/types/:subCategoryId", getTypes);

// UPDATE TYPE
menuRoutes.put(
  "/type/:id",
  typeUpload.array("images", 10),
  updateType
);

// DELETE TYPE
menuRoutes.delete(
  "/type/:id",
  deleteType
);
menuRoutes.get(
  "/used-categories/:businessCode",
  getUsedCategoriesByBusinessCode
);


// ⚙️ SETTINGS
menuRoutes.get("/settings/:businessCode", getBusinessSettings);
menuRoutes.patch("/order-settings", updateOrderSettings);


menuRoutes.post("/add", menuUpload.single("image"), addMenuItem);
menuRoutes.put("/update", menuUpload.single("image"), updateMenuItem);

menuRoutes.delete("/delete", deleteMenuItem);
menuRoutes.get("/admin", getMenuByBusinessId);
// Customer (QR)
menuRoutes.get("/by-business/:businessCode", getMenuByBusinessCode);
menuRoutes.get("/categories-all", getAllCategoriesForSuperAdmin);
menuRoutes.get("/search-menu-path", searchMenuPath);
export default menuRoutes;

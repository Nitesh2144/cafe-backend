import express from "express";
import {
  addMenuItem,
  getMenuByBusinessCode,
  updateMenuItem,
  deleteMenuItem,
  getMenuByBusinessId,
  addCategory,
  getCategoriesByBusinessCode,
  deleteCategoryByBusinessCode,
    getBusinessSettings,
  updateOrderSettings,
} from "../controllers/menuController.js";
import { menuUpload } from "../middleware/menuUpload.js";

const menuRoutes = express.Router();


// ⚙️ SETTINGS
menuRoutes.get("/settings/:businessCode", getBusinessSettings);
menuRoutes.patch("/order-settings", updateOrderSettings);


menuRoutes.post("/add", menuUpload.single("image"), addMenuItem);
menuRoutes.put("/update", menuUpload.single("image"), updateMenuItem);

menuRoutes.delete("/delete", deleteMenuItem);
menuRoutes.get("/admin", getMenuByBusinessId);
// Customer (QR)
menuRoutes.get("/by-business/:businessCode", getMenuByBusinessCode);

menuRoutes.post("/add/categorie", addCategory );

menuRoutes.get("/categories/:businessCode", getCategoriesByBusinessCode );
menuRoutes.delete(
  "/category/:businessCode/:categoryId",
  deleteCategoryByBusinessCode
);

export default menuRoutes;

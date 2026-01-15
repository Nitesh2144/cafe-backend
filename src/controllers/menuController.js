import Menu from "../models/Menu.js";
import Business from "../models/Business.js";
import cloudinary from "../utils/cloudinary.js";
import Category from "../models/Category.js";


export const addCategory = async (req, res) => {
  try {
    const { businessId, name } = req.body;

    if (!businessId || !name) {
      return res.status(400).json({
        message: "businessId and name are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const category = await Category.create({
      businessId,
      businessCode: business.businessCode,
      name,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("❌ Add category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getCategoriesByBusinessCode = async (req, res) => {
  try {
    const { businessCode } = req.params;

    if (!businessCode) {
      return res.status(400).json({
        message: "businessCode is required",
      });
    }

    const categories = await Category.find({ businessCode })
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteCategoryByBusinessCode = async (req, res) => {
  try {
    const { businessCode, categoryId } = req.params;

    if (!businessCode || !categoryId) {
      return res.status(400).json({
        message: "businessCode and categoryId are required",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      businessCode: businessCode,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found for this business",
      });
    }

    // 🗑️ ONLY CATEGORY DELETE
    await category.deleteOne();

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        message: "categoryId is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // 🗑️ ONLY CATEGORY DELETE
    await category.deleteOne();

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { businessId, name, price, category } = req.body;

    if (!businessId || !name || price === undefined) {
      return res.status(400).json({
        message: "businessId, name and price are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let imageUrl = "";

    // 🖼️ IMAGE UPLOAD
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        req.file.path,
        { folder: "menu-items" }
      );
      imageUrl = result.secure_url;
    }

    const item = await Menu.create({
      businessId,
      businessCode: business.businessCode,
      name,
      price,
      category,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Menu item added",
      item,
    });
  } catch (error) {
    console.error("❌ Add menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= GET MENU (CUSTOMER VIEW) ================= */
export const getMenuByBusinessCode = async (req, res) => {
  try {
    const { businessCode } = req.params;

    if (!businessCode) {
      return res.status(400).json({
        message: "businessCode is required",
      });
    }

    const menu = await Menu.find({
      businessCode,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    res.json(menu);
  } catch (error) {
    console.error("❌ Get menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE MENU ITEM ================= */
export const updateMenuItem = async (req, res) => {
  try {
    const { menuId, name, price, category, isAvailable } = req.body;

    const item = await Menu.findById(menuId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (name) item.name = name;
    if (price !== undefined) item.price = price;
    if (category) item.category = category;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    // 🖼️ new image
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        req.file.path,
        { folder: "menu-items" }
      );
      item.image = result.secure_url;
    }

    await item.save();

    res.json({
      message: "Menu item updated",
      item,
    });
  } catch (error) {
    console.error("❌ Update menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= DELETE MENU ITEM ================= */
export const deleteMenuItem = async (req, res) => {
  try {
    const { menuId } = req.body;

    const item = await Menu.findById(menuId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await item.deleteOne();

    res.json({ message: "Menu item deleted" });
  } catch (error) {
    console.error("❌ Delete menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getMenuByBusinessId = async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({
        message: "businessId is required",
      });
    }

    const menu = await Menu.find({ businessId })
      .sort({ category: 1, name: 1 });

    res.json(menu);
  } catch (error) {
    console.error("❌ Get admin menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

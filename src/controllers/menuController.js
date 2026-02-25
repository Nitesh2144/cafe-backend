import Menu from "../models/Menu.js";
import Business from "../models/Business.js";
import cloudinary from "../utils/cloudinary.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Type from "../models/Type.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.create({
      name: name.trim().toUpperCase(),
      createdBy: "SUPER_ADMIN",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Category already exists" });
  }
};

export const addSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // ❌ Validation
    if (!name || !categoryId) {
      return res.status(400).json({
        message: "name and categoryId are required",
      });
    }

    // ✅ Check parent category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // ❌ Duplicate check inside same category
    const exists = await SubCategory.findOne({
      name,
      categoryId,
    });

    if (exists) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    // ✅ Create sub category
    const subCategory = await SubCategory.create({
      name,
      categoryId,
      createdBy: "SUPER_ADMIN",
    });

    res.status(201).json(subCategory);
  } catch (error) {
    console.error("Add sub category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getSubCategories = async (req, res) => {
  const { categoryId } = req.params;
  const data = await SubCategory.find({ categoryId }).sort({ name: 1 });
  res.json(data);
};

export const addType = async (req, res) => {
  try {
    const { name, categoryId, subCategoryId } = req.body;

    if (!name || !categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "menu-types",
              transformation: [
                { width: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const type = await Type.create({
      name,
      categoryId,
      subCategoryId,
      images: imageUrls,
    });

    res.status(201).json(type);

  } catch (error) {
    console.error("Add type error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getTypes = async (req, res) => {
  const { subCategoryId } = req.params;
  const data = await Type.find({ subCategoryId }).sort({ name: 1 });
  res.json(data);
};


export const getBusinessSettings = async (req, res) => {
  try {
    const { businessCode } = req.params;

    if (!businessCode) {
      return res.status(400).json({
        message: "businessCode is required",
      });
    }

 const business = await Business.findOne({
  businessCode: businessCode.toUpperCase(),
});


    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    res.json({
      orderSettings: {
        enableItemNote: business.orderSettings?.enableItemNote ?? false,
      },
      feedbackSettings: {
        enableFeedback:
          business.feedbackSettings?.enableFeedback ?? false,
        allowBeforeCompletion:
          business.feedbackSettings?.allowBeforeCompletion ?? false,
      },
    });
  } catch (error) {
    console.error("❌ Get business settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ⚙️ UPDATE ORDER SETTINGS
   =============================== */
export const updateOrderSettings = async (req, res) => {
  try {
    const { businessCode, enableItemNote } = req.body;

    if (!businessCode || typeof enableItemNote !== "boolean") {
      return res.status(400).json({
        message: "businessCode and enableItemNote are required",
      });
    }

    const business = await Business.findOneAndUpdate(
  { businessCode: businessCode.toUpperCase() },
      {
        "orderSettings.enableItemNote": enableItemNote,
      },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    res.json({
      message: "Order settings updated successfully",
      enableItemNote: business.orderSettings.enableItemNote,
    });
  } catch (error) {
    console.error("❌ Update order settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getAllCategoriesForSuperAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (e) {
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

    // 1️⃣ Check category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // 2️⃣ Get all subcategories under this category
    const subCategories = await SubCategory.find({ categoryId });

    const subCategoryIds = subCategories.map(sub => sub._id);

    // 3️⃣ Delete all types under those subcategories
    await Type.deleteMany({
      subCategoryId: { $in: subCategoryIds },
    });

    // 4️⃣ Delete all subcategories
    await SubCategory.deleteMany({ categoryId });

    // 5️⃣ Delete category
    await Category.findByIdAndDelete(categoryId);

    res.json({
      message: "Category, SubCategories and Types deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const addMenuItem = async (req, res) => {
  try {
    const {
  businessId,
  name,
  price,
  categoryId,
  subCategoryId,
  typeId,
} = req.body;


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

// 🟢 If frontend sent generated image URL
if (req.body.generatedImageUrl) {
  imageUrl = req.body.generatedImageUrl;
}

// 🟢 If real file uploaded from gallery
else if (req.file && req.file.buffer && req.file.buffer.length > 0) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "menu-items" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  imageUrl = result.secure_url;
}



    const item = await Menu.create({
      businessId,
      businessCode: business.businessCode,
      name,
      price,
     categoryId,
  subCategoryId,
  typeId,
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

    // 🔥 Business nikalo (settings ke liye)
const business = await Business.findOne({
  businessCode: businessCode.toUpperCase(),
});


    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

  const menu = await Menu.find({
  businessCode: businessCode.toUpperCase(),
  isAvailable: true,
})
  .populate("categoryId", "name")
  .populate("subCategoryId", "name")
  .populate("typeId", "name")
  .sort({ name: 1 });

    res.json({
      businessName: business.businessName,
      enableItemNote: business.orderSettings?.enableItemNote || false, // 👈 IMPORTANT
  enableFeedback: business.feedbackSettings?.enableFeedback ?? false,
   allowBeforeCompletion: business.feedbackSettings?.allowBeforeCompletion ?? false,
                menu,

    });
  } catch (error) {
    console.error("❌ Get menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= UPDATE MENU ITEM ================= */
export const updateMenuItem = async (req, res) => {
  try {
 const {
  menuId,
  name,
  price,
  categoryId,
  subCategoryId,
  typeId,
  isAvailable,
} = req.body;

const item = await Menu.findById(menuId);
if (!item) {
  return res.status(404).json({ message: "Menu item not found" });
}
if (categoryId) item.categoryId = categoryId;
if (subCategoryId) item.subCategoryId = subCategoryId;
if (typeId) item.typeId = typeId;



    if (name) item.name = name;
    if (price !== undefined) item.price = price;
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

    const menu = await Menu.find({
      businessId,
    })
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .populate("typeId", "name")
      .sort({ name: 1 });

    res.json(menu);
  } catch (error) {
    console.error("❌ Get admin menu error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateType = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) return res.status(404).json({ message: "Type not found" });

    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    let newImages = [];

    // 🔥 Use upload_stream (same as addType)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "menu-types",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        newImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    type.name = req.body.name;
    type.images = [...existingImages, ...newImages];

    await type.save();

    res.json(type);
  } catch (err) {
    console.error("Update type error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteType = async (req, res) => {
  try {
    const { id } = req.params;

    const type = await Type.findById(id);
    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    // 🔥 Proper delete
    for (const img of type.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await type.deleteOne();

    res.json({ message: "Type deleted successfully" });

  } catch (error) {
    console.error("Delete type error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsedCategoriesByBusinessCode = async (req, res) => {
  try {
    const { businessCode } = req.params;

    if (!businessCode) {
      return res.status(400).json({
        message: "businessCode is required",
      });
    }

    // 🔹 Step 1: Unique categoryIds nikalo
    const categoryIds = await Menu.distinct("categoryId", {
      businessCode: businessCode.toUpperCase(),
    });

    // 🔹 Step 2: Un categories ko fetch karo
    const categories = await Category.find({
      _id: { $in: categoryIds },
    }).sort({ name: 1 });

    res.json(categories);

  } catch (error) {
    console.error("❌ Get used categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

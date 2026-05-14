import { UserModel } from "../models/user.model.js";
import { CategoryModel } from "../models/category.model.js";
import slugify from "slugify"; // Added slugify for better slug generation

// 1. CREATE CATEGORY
export const createCategory = async (req, res) => {
  const { name, description, image, status } = req.body;

  const requiredFields = { name, description, image };
  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({
        message: `${field} is required`,
        success: false,
      });
    }
  }

  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Please log in to create a category",
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: req.user.email });
    console.log(user);

    if (!user || user.role !== "super_admin") {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to create a category",
        success: false,
      });
    }

    // Check if category name or slug already exists to prevent duplicate key errors
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category with this name already exists",
        success: false,
      });
    }

    const newCategory = new CategoryModel({
      name,
      description,
      image,
      slug: slugify(name, { lower: true }),
      userID: user._id,
      authorDetails: {
        name: user.name,
        email: user.email,
        username: user.username,
      },
      status: status || "published",
      postCount: 0,
      metaTitle: name,
      metaDescription: description,
      metaKeywords: [],
      canonicalUrl: "",
      ogTitle: name,
      ogDescription: description,
      ogImage: image,
      twitterTitle: name,
      twitterDescription: description,
      twitterImage: image,
    });

    await newCategory.save();

    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// 2. GET ALL PUBLISHED CATEGORIES (For Public/Frontend)
export const publishCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const categories = await CategoryModel.find({ status: "published" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Optimization: Calculate total items only once
    const totalItems = await CategoryModel.countDocuments({
      status: "published",
    });

    if (categories.length === 0) {
      return res.status(404).json({
        message: "No categories found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// 3. GET CATEGORY BY SLUG (Public/Frontend)
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await CategoryModel.findOne({ slug, status: "published" });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Category retrieved successfully",
      category,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// 4. GET ALL CATEGORIES (For Admin Panel - includes Drafts)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const user = await UserModel.findById(req.user.id);
    if (user.role !== "super_admin")
      return res.status(403).json({ message: "Forbidden", success: false });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const categories = await CategoryModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await CategoryModel.countDocuments();

    return res.status(200).json({
      message: "Admin categories retrieved successfully",
      categories,
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// 5. UPDATE CATEGORY (Admin Only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, status, slug } = req.body;

    // Check auth and admin
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const user = await UserModel.findById(req.user.id);
    if (!user || user.role !== "super_admin")
      return res.status(403).json({ message: "Forbidden", success: false });

    let category = await CategoryModel.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    // Update fields
    if (name) {
      category.name = name;
      category.slug = slug || name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
    }
    if (description) category.description = description;
    if (image) category.image = image;
    if (status) category.status = status;
    if (slug) category.slug = slug; // Override if custom slug provided

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      category,
      success: true,
    });
  } catch (error) {
    // Handle duplicate key error (e.g., if updating to a name that already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Category name or slug already exists",
        success: false,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

// 6. DELETE CATEGORY (Admin Only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const user = await UserModel.findById(req.user.id);
    if (!user || user.role !== "super_admin")
      return res.status(403).json({ message: "Forbidden", success: false });

    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

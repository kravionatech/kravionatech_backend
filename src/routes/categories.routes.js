import express from "express";
import {
  createCategory,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  publishCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";

export const categoriesRouter = express.Router();

// 1. Create a new category (super_admin protected)
categoriesRouter.post("/category/new", authMiddleWare, roleCheck("super_admin"), createCategory);

// 2. Get all published categories (Public)
categoriesRouter.get("/categories/public", publishCategories);

// 3. Get category by slug (Public)
categoriesRouter.get("/category/:slug", getCategoryBySlug);

// 4. Get all categories including drafts (super_admin protected)
categoriesRouter.get(
  "/categories/admin",
  authMiddleWare,
  roleCheck("super_admin"),
  getAllCategoriesAdmin,
);

// 5. Update an existing category (super_admin protected)
categoriesRouter.put("/category/:id", authMiddleWare, roleCheck("super_admin"), updateCategory);

// 6. Delete a category (super_admin protected)
categoriesRouter.delete("/category/:id", authMiddleWare, roleCheck("super_admin"), deleteCategory);

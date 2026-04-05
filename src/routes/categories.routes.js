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

export const categoriesRouter = express.Router();

// 1. Create a new category (Admin Protected)
categoriesRouter.post("/category/new", authMiddleWare, createCategory);

// 2. Get all published categories (Public)
categoriesRouter.get("/categories/public", publishCategories);

// 3. Get category by slug (Public)
categoriesRouter.get("/category/:slug", getCategoryBySlug);

// 4. Get all categories including drafts (Admin Protected)
categoriesRouter.get(
  "/categories/admin",
  authMiddleWare,
  getAllCategoriesAdmin,
);

// 5. Update an existing category (Admin Protected)
categoriesRouter.put("/category/:id", authMiddleWare, updateCategory);

// 6. Delete a category (Admin Protected)
categoriesRouter.delete("/category/:id", authMiddleWare, deleteCategory);

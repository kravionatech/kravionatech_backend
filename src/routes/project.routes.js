import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createProject,
  getPublicProjects,
  getProjectBySlug,
  getAdminProjects,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

export const projectRouter = express.Router();

// Public
projectRouter.get("/projects", getPublicProjects);                       // ?category=slug&page&limit
projectRouter.get("/project/:slug", getProjectBySlug);

// Admin
projectRouter.post("/admin/projects", authMiddleWare, roleCheck("super_admin"), createProject);
projectRouter.get("/admin/projects", authMiddleWare, roleCheck("super_admin"), getAdminProjects);
projectRouter.put("/admin/project/:id", authMiddleWare, roleCheck("super_admin"), updateProject);
projectRouter.delete("/admin/project/:id", authMiddleWare, roleCheck("super_admin"), deleteProject);

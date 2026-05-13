import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createTeamMember,
  getPublicTeam,
  getAdminTeam,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";

export const teamRouter = express.Router();

// Public
teamRouter.get("/team", getPublicTeam);

// Admin
teamRouter.post("/admin/team", authMiddleWare, roleCheck("admin", "super_admin"), createTeamMember);
teamRouter.get("/admin/team", authMiddleWare, getAdminTeam);
teamRouter.put("/admin/team/:id", authMiddleWare, roleCheck("admin", "super_admin"), updateTeamMember);
teamRouter.delete("/admin/team/:id", authMiddleWare, roleCheck("admin", "super_admin"), deleteTeamMember);

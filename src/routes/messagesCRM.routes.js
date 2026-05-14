import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  assignMessage,
  addMessageNote,
  getLeadsStats,
} from "../controllers/messagesCRM.controller.js";

export const messagesCRMRouter = express.Router();

// PATCH /api/admin/messages/:id/assign
messagesCRMRouter.patch(
  "/admin/messages/:id/assign",
  authMiddleWare,
  roleCheck("super_admin"),
  assignMessage,
);

// POST /api/admin/messages/:id/note
messagesCRMRouter.post(
  "/admin/messages/:id/note",
  authMiddleWare,
  roleCheck("super_admin"),
  addMessageNote,
);

// GET /api/admin/leads/stats
messagesCRMRouter.get(
  "/admin/leads/stats",
  authMiddleWare,
  roleCheck("super_admin"),
  getLeadsStats,
);

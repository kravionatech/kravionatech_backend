import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
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
  assignMessage,
);

// POST /api/admin/messages/:id/note
messagesCRMRouter.post(
  "/admin/messages/:id/note",
  authMiddleWare,
  addMessageNote,
);

// GET /api/admin/leads/stats
messagesCRMRouter.get(
  "/admin/leads/stats",
  authMiddleWare,
  getLeadsStats,
);

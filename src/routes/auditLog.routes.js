import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  getAuditLogs,
  getAuditLogsByUser,
} from "../controllers/auditLog.controller.js";

export const auditLogRouter = express.Router();

// GET /api/admin/audit-logs?page&limit&userId&resource&from&to
auditLogRouter.get(
  "/admin/audit-logs",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  getAuditLogs,
);

// GET /api/admin/audit-logs/user/:userId
auditLogRouter.get(
  "/admin/audit-logs/user/:userId",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  getAuditLogsByUser,
);

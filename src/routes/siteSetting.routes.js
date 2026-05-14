import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  getPublicSettings,
  getAllSettings,
  getSettingsByGroup,
  bulkUpdateSettings,
  updateSingleSetting,
} from "../controllers/siteSetting.controller.js";

export const siteSettingRouter = express.Router();

// Public — key:value map only
siteSettingRouter.get("/settings/public", getPublicSettings);

// Admin — all fields (super_admin only)
siteSettingRouter.get("/admin/settings", authMiddleWare, roleCheck("super_admin"), getAllSettings);

// Admin — by group (super_admin only)
siteSettingRouter.get("/admin/settings/:group", authMiddleWare, roleCheck("super_admin"), getSettingsByGroup);

// Admin — bulk update [{ key, value }]
siteSettingRouter.put(
  "/admin/settings",
  authMiddleWare,
  roleCheck("super_admin"),
  bulkUpdateSettings,
);

// Admin — single update
siteSettingRouter.put(
  "/admin/settings/:key",
  authMiddleWare,
  roleCheck("super_admin"),
  updateSingleSetting,
);

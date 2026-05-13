import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  scheduleCampaign,
} from "../controllers/emailCampaign.controller.js";

export const emailCampaignRouter = express.Router();

emailCampaignRouter.post(
  "/admin/campaigns",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  createCampaign,
);

emailCampaignRouter.get("/admin/campaigns", authMiddleWare, getCampaigns);

emailCampaignRouter.get("/admin/campaign/:id", authMiddleWare, getCampaignById);

emailCampaignRouter.put(
  "/admin/campaign/:id",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  updateCampaign,
);

emailCampaignRouter.delete(
  "/admin/campaign/:id",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  deleteCampaign,
);

emailCampaignRouter.post(
  "/admin/campaign/:id/send",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  sendCampaign,
);

emailCampaignRouter.post(
  "/admin/campaign/:id/schedule",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  scheduleCampaign,
);

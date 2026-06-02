/**
 * SiteConfig routes — dynamization spec §1.2
 *
 * GET  /api/v1/public/site-config  → Public (Redis 10 min)
 * PUT  /api/v1/site-config         → Protected: super_admin
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicSiteConfig,
  updateSiteConfig,
} from "../controllers/siteConfig.controller.js";

export const siteConfigRouter = express.Router();

// Public — cached 10 minutes
siteConfigRouter.get(
  "/v1/public/site-config",
  cacheMiddleware("siteConfig", 600),
  getPublicSiteConfig,
);

// Protected — super_admin only
siteConfigRouter.put(
  "/v1/site-config",
  authMiddleWare,
  roleCheck("super_admin"),
  updateSiteConfig,
);

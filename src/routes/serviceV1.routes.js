/**
 * Service routes — dynamization spec §2.3
 *
 * Public (Redis-cached):
 *   GET /api/v1/public/services             → 5 min
 *   GET /api/v1/public/services/nav         → 30 min
 *   GET /api/v1/public/services/:slug
 *
 * Protected (super_admin):
 *   POST   /api/v1/services
 *   PUT    /api/v1/services/:id
 *   DELETE /api/v1/services/:id
 *   PUT    /api/v1/services/reorder
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicServices,
  getPublicServicesNav,
  getPublicServiceBySlug,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "../controllers/serviceV1.controller.js";

export const serviceV1Router = express.Router();

// ── Public ──────────────────────────────────────────────────
serviceV1Router.get(
  "/v1/public/services",
  cacheMiddleware("services", 300), // 5 min
  getPublicServices,
);

serviceV1Router.get(
  "/v1/public/services/nav",
  cacheMiddleware("servicesNav", 1800), // 30 min
  getPublicServicesNav,
);

serviceV1Router.get(
  "/v1/public/services/:slug",
  getPublicServiceBySlug, // detail page — cache via the public path
);

// ── Protected ───────────────────────────────────────────────
serviceV1Router.post(
  "/v1/services",
  authMiddleWare,
  roleCheck("super_admin"),
  createService,
);

serviceV1Router.put(
  "/v1/services/reorder",
  authMiddleWare,
  roleCheck("super_admin"),
  reorderServices,
);

serviceV1Router.put(
  "/v1/services/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updateService,
);

serviceV1Router.delete(
  "/v1/services/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deleteService,
);

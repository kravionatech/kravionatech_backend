import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createService,
  getPublicServices,
  getServiceBySlug,
  getAdminServices,
  updateService,
  deleteService,
  updateServiceOrder,
} from "../controllers/service.controller.js";

export const serviceRouter = express.Router();

// ──────────────────────────────────────────────────────
// Public Routes (no auth required)
// ──────────────────────────────────────────────────────

// GET /api/services           → All published services (paginated, sorted by order)
serviceRouter.get("/services", getPublicServices);

// GET /api/service/:slug      → Single published service detail
serviceRouter.get("/service/:slug", getServiceBySlug);

// ──────────────────────────────────────────────────────
// Admin Routes (auth required)
// ──────────────────────────────────────────────────────

// POST /api/admin/services    → Create new service (admin only)
serviceRouter.post(
  "/admin/services",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  createService,
);

// GET /api/admin/services     → All services incl. drafts (auth)
serviceRouter.get(
  "/admin/services",
  authMiddleWare,
  getAdminServices,
);

// PUT /api/admin/service/:id  → Full update (admin only)
serviceRouter.put(
  "/admin/service/:id",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  updateService,
);

// DELETE /api/admin/service/:id → Delete (admin only)
serviceRouter.delete(
  "/admin/service/:id",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  deleteService,
);

// PATCH /api/admin/service/:id/order → Update display order (admin only)
serviceRouter.patch(
  "/admin/service/:id/order",
  authMiddleWare,
  roleCheck("admin", "super_admin"),
  updateServiceOrder,
);

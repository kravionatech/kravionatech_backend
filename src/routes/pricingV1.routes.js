/**
 * PricingPlan routes — dynamization spec §6.2
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicPricing,
  createPricing,
  updatePricing,
  deletePricing,
  getAdminPricing,
  getAdminPricingById,
} from "../controllers/pricingV1.controller.js";

export const pricingV1Router = express.Router();

// Public — cached 10 min
pricingV1Router.get(
  "/v1/public/pricing",
  cacheMiddleware("pricing", 600),
  getPublicPricing,
);

// Protected
pricingV1Router.get(
  "/v1/pricing",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminPricing,
);
pricingV1Router.get(
  "/v1/pricing/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminPricingById,
);
pricingV1Router.post(
  "/v1/pricing",
  authMiddleWare,
  roleCheck("super_admin"),
  createPricing,
);
pricingV1Router.put(
  "/v1/pricing/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updatePricing,
);
pricingV1Router.delete(
  "/v1/pricing/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deletePricing,
);

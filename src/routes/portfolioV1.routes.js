/**
 * Portfolio routes — dynamization spec §4.2
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicPortfolio,
  getPublicPortfolioFeatured,
  getPublicPortfolioBySlug,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getAdminPortfolio,
  getAdminPortfolioById,
} from "../controllers/portfolioV1.controller.js";

export const portfolioV1Router = express.Router();

// Public
portfolioV1Router.get(
  "/v1/public/portfolio",
  cacheMiddleware("portfolio", 300),
  getPublicPortfolio,
);
portfolioV1Router.get(
  "/v1/public/portfolio/featured",
  cacheMiddleware("portfolioFeatured", 300),
  getPublicPortfolioFeatured,
);
portfolioV1Router.get("/v1/public/portfolio/:slug", getPublicPortfolioBySlug);

// Protected
portfolioV1Router.get(
  "/v1/portfolio",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminPortfolio,
);
portfolioV1Router.get(
  "/v1/portfolio/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminPortfolioById,
);
portfolioV1Router.post(
  "/v1/portfolio",
  authMiddleWare,
  roleCheck("super_admin"),
  createPortfolio,
);
portfolioV1Router.put(
  "/v1/portfolio/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updatePortfolio,
);
portfolioV1Router.delete(
  "/v1/portfolio/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deletePortfolio,
);

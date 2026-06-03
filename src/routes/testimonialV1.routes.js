/**
 * Testimonial routes — dynamization spec §7.2
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicTestimonials,
  getPublicFeaturedTestimonials,
  createTestimonial,
  updateTestimonial,
  approveTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  getAdminTestimonialById,
} from "../controllers/testimonialV1.controller.js";

export const testimonialV1Router = express.Router();

// Public
testimonialV1Router.get(
  "/v1/public/testimonials",
  cacheMiddleware("testimonials", 300),
  getPublicTestimonials,
);
testimonialV1Router.get(
  "/v1/public/testimonials/featured",
  cacheMiddleware("testimonialsFeatured", 300),
  getPublicFeaturedTestimonials,
);

// Protected
testimonialV1Router.get(
  "/v1/testimonials",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminTestimonials,
);
testimonialV1Router.get(
  "/v1/testimonials/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminTestimonialById,
);
testimonialV1Router.post(
  "/v1/testimonials",
  authMiddleWare,
  roleCheck("super_admin"),
  createTestimonial,
);
testimonialV1Router.put(
  "/v1/testimonials/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updateTestimonial,
);
testimonialV1Router.put(
  "/v1/testimonials/:id/approve",
  authMiddleWare,
  roleCheck("super_admin"),
  approveTestimonial,
);
testimonialV1Router.delete(
  "/v1/testimonials/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deleteTestimonial,
);

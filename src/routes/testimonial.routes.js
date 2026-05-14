import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  createTestimonial,
  getPublicTestimonials,
  getAdminTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";

export const testimonialRouter = express.Router();

// Public
testimonialRouter.get("/testimonials", getPublicTestimonials);          // ?featured=true&page&limit

// Admin
testimonialRouter.post("/admin/testimonials", authMiddleWare, roleCheck("super_admin"), createTestimonial);
testimonialRouter.get("/admin/testimonials", authMiddleWare, roleCheck("super_admin"), getAdminTestimonials);
testimonialRouter.put("/admin/testimonial/:id", authMiddleWare, roleCheck("super_admin"), updateTestimonial);
testimonialRouter.delete("/admin/testimonial/:id", authMiddleWare, roleCheck("super_admin"), deleteTestimonial);

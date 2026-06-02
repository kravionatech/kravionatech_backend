/**
 * CaseStudy routes — dynamization spec §5.2
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  getPublicCaseStudies,
  getPublicCaseStudyBySlug,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from "../controllers/caseStudyV1.controller.js";

export const caseStudyV1Router = express.Router();

// Public (no spec-mandated cache; keep it simple)
caseStudyV1Router.get("/v1/public/case-studies", getPublicCaseStudies);
caseStudyV1Router.get("/v1/public/case-studies/:slug", getPublicCaseStudyBySlug);

// Protected
caseStudyV1Router.post(
  "/v1/case-studies",
  authMiddleWare,
  roleCheck("super_admin"),
  createCaseStudy,
);
caseStudyV1Router.put(
  "/v1/case-studies/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updateCaseStudy,
);
caseStudyV1Router.delete(
  "/v1/case-studies/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deleteCaseStudy,
);

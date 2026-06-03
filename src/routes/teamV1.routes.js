/**
 * Team routes — dynamization spec §3.3
 */
import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { cacheMiddleware } from "../utils/cache.js";
import {
  getPublicTeam,
  getPublicTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeam,
  getAdminTeam,
  getAdminTeamMemberById,
} from "../controllers/teamV1.controller.js";

export const teamV1Router = express.Router();

// Public
teamV1Router.get(
  "/v1/public/team",
  cacheMiddleware("team", 300),
  getPublicTeam,
);
teamV1Router.get("/v1/public/team/:slug", getPublicTeamMember);

// Protected
// IMPORTANT: `reorder` must be registered BEFORE the `:id` routes
// or Express will match "/v1/team/reorder" against the `:id` param
// (and CastError because "reorder" is not a valid ObjectId).
teamV1Router.get(
  "/v1/team",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminTeam,
);
teamV1Router.put(
  "/v1/team/reorder",
  authMiddleWare,
  roleCheck("super_admin"),
  reorderTeam,
);
teamV1Router.get(
  "/v1/team/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  getAdminTeamMemberById,
);
teamV1Router.post(
  "/v1/team",
  authMiddleWare,
  roleCheck("super_admin"),
  createTeamMember,
);
teamV1Router.put(
  "/v1/team/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updateTeamMember,
);
teamV1Router.delete(
  "/v1/team/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deleteTeamMember,
);

import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import { trackLimiter } from "../middleware/rateLimiter.js";
import {
  trackPageView,
  trackEvent,
  getAnalyticsOverview,
  getVisitorStats,
  getTopPages,
  getPostAnalytics,
  getRealtimeAnalytics,
  getDeviceStats,
  getGeoStats,
} from "../controllers/analytics.controller.js";

export const analyticsRouter = express.Router();

// ── Public Tracking (no auth, trackLimiter) ──────────────────
analyticsRouter.post("/track/pageview", trackLimiter, trackPageView);
analyticsRouter.post("/track/event", trackLimiter, trackEvent);

// ── Admin Analytics Reports (super_admin only) ───────────────
// All support: ?from=&to=&granularity=
analyticsRouter.get("/admin/analytics/overview",  authMiddleWare, roleCheck("super_admin"), getAnalyticsOverview);
analyticsRouter.get("/admin/analytics/visitors",  authMiddleWare, roleCheck("super_admin"), getVisitorStats);
analyticsRouter.get("/admin/analytics/pages",     authMiddleWare, roleCheck("super_admin"), getTopPages);
analyticsRouter.get("/admin/analytics/posts",     authMiddleWare, roleCheck("super_admin"), getPostAnalytics);
analyticsRouter.get("/admin/analytics/realtime",  authMiddleWare, roleCheck("super_admin"), getRealtimeAnalytics);
analyticsRouter.get("/admin/analytics/devices",   authMiddleWare, roleCheck("super_admin"), getDeviceStats);
analyticsRouter.get("/admin/analytics/geo",       authMiddleWare, roleCheck("super_admin"), getGeoStats);

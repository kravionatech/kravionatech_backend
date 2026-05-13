import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
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

// ── Admin Analytics Reports (auth required) ──────────────────
// All support: ?from=&to=&granularity=
analyticsRouter.get("/admin/analytics/overview",  authMiddleWare, getAnalyticsOverview);
analyticsRouter.get("/admin/analytics/visitors",  authMiddleWare, getVisitorStats);
analyticsRouter.get("/admin/analytics/pages",     authMiddleWare, getTopPages);
analyticsRouter.get("/admin/analytics/posts",     authMiddleWare, getPostAnalytics);
analyticsRouter.get("/admin/analytics/realtime",  authMiddleWare, getRealtimeAnalytics);
analyticsRouter.get("/admin/analytics/devices",   authMiddleWare, getDeviceStats);
analyticsRouter.get("/admin/analytics/geo",       authMiddleWare, getGeoStats);

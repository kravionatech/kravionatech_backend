import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { PageViewModel } from "../models/PageView.model.js";
import { PostAnalyticsModel } from "../models/PostAnalytics.model.js";

// Helper: normalise device string
const detectDevice = (uaDevice) => {
  const type = uaDevice?.type;
  if (type === "mobile") return "mobile";
  if (type === "tablet") return "tablet";
  if (!type) return "desktop";
  return "unknown";
};

// ─────────────────────────────────────────────────────────────
// POST /api/track/pageview   →  No auth
// Body: { path, referrer, userAgent, sessionId, device }
// ─────────────────────────────────────────────────────────────
export const trackPageView = async (req, res) => {
  try {
    const { path, referrer, sessionId, device } = req.body;
    const uaString = req.body.userAgent || req.headers["user-agent"] || "";

    if (!path) {
      return res.status(400).json({
        success: false,
        message: "path is required",
      });
    }

    // Parse user agent
    const parser = new UAParser(uaString);
    const ua = parser.getResult();

    // Hash IP for privacy (MD5)
    const rawIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown";
    const ipHash = crypto.createHash("md5").update(rawIp).digest("hex");

    // Detect geo — graceful fallback if geoip-lite not installed
    let country = "Unknown";
    let city = "Unknown";
    try {
      const geoip = await import("geoip-lite");
      const geo = geoip.default?.lookup?.(rawIp);
      if (geo) {
        country = geo.country || "Unknown";
        city = geo.city || "Unknown";
      }
    } catch (_) {
      // geoip-lite not installed — continue without geo
    }

    await PageViewModel.create({
      path,
      referrer: referrer || "",
      userAgent: uaString,
      ipHash,
      country,
      city,
      device: device || detectDevice(ua.device),
      browser: ua.browser?.name || "Unknown",
      os: ua.os?.name || "Unknown",
      sessionId: sessionId || "",
    });

    return res.status(201).json({ success: true, message: "Pageview tracked" });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/track/event   →  No auth
// Body: { type, postSlug, value }
// type: scroll | reaction | duration
// ─────────────────────────────────────────────────────────────
export const trackEvent = async (req, res) => {
  try {
    const { type, postSlug, value, sessionId } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "type is required" });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (type === "scroll" && postSlug) {
      await PostAnalyticsModel.findOneAndUpdate(
        { postSlug, date: today },
        { $max: { scrollDepth: Number(value) || 0 } },
        { upsert: true },
      );
    } else if (type === "reaction" && postSlug) {
      const reactionField = ["like", "dislike", "share"].includes(value)
        ? value
        : "like";
      await PostAnalyticsModel.findOneAndUpdate(
        { postSlug, date: today },
        { $inc: { [`reactions.${reactionField}`]: 1 } },
        { upsert: true },
      );
    } else if (type === "duration" && sessionId) {
      await PageViewModel.findOneAndUpdate(
        { sessionId },
        { $set: { duration: Number(value) || 0 } },
        { sort: { timestamp: -1 } },
      );
    }

    return res.status(200).json({ success: true, message: "Event tracked" });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Helper: date range from query params
// ─────────────────────────────────────────────────────────────
const dateRange = (req) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  to.setUTCHours(23, 59, 59, 999);
  return { from, to };
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/overview   →  auth
// ─────────────────────────────────────────────────────────────
export const getAnalyticsOverview = async (req, res) => {
  try {
    const { from, to } = dateRange(req);
    const prevFrom = new Date(from.getTime() - (to - from));

    const [current, previous] = await Promise.all([
      PageViewModel.countDocuments({ timestamp: { $gte: from, $lte: to } }),
      PageViewModel.countDocuments({ timestamp: { $gte: prevFrom, $lt: from } }),
    ]);

    const uniqueVisitors = await PageViewModel.distinct("ipHash", {
      timestamp: { $gte: from, $lte: to },
    });

    const pctChange =
      previous > 0 ? (((current - previous) / previous) * 100).toFixed(1) : null;

    return res.status(200).json({
      success: true,
      data: {
        views: current,
        visitors: uniqueVisitors.length,
        pctChange,
        period: { from, to },
      },
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/visitors   →  auth
// Daily chart: views + device breakdown
// ─────────────────────────────────────────────────────────────
export const getVisitorStats = async (req, res) => {
  try {
    const { from, to } = dateRange(req);

    const [daily, devices] = await Promise.all([
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: { daily, devices },
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/pages   →  auth
// Top pages by view count
// ─────────────────────────────────────────────────────────────
export const getTopPages = async (req, res) => {
  try {
    const { from, to } = dateRange(req);

    const pages = await PageViewModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]);

    return res.status(200).json({ success: true, data: pages });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/posts   →  auth
// Per-post analytics
// ─────────────────────────────────────────────────────────────
export const getPostAnalytics = async (req, res) => {
  try {
    const { from, to } = dateRange(req);

    const posts = await PostAnalyticsModel.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: "$postSlug",
          views: { $sum: "$views" },
          uniqueViews: { $sum: "$uniqueViews" },
          avgReadTime: { $avg: "$avgReadTime" },
          scrollDepth: { $avg: "$scrollDepth" },
          likes: { $sum: "$reactions.like" },
          dislikes: { $sum: "$reactions.dislike" },
          shares: { $sum: "$reactions.share" },
        },
      },
      { $sort: { views: -1 } },
    ]);

    return res.status(200).json({ success: true, data: posts });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/realtime   →  auth
// Last 5 minutes active visitors + current pages
// ─────────────────────────────────────────────────────────────
export const getRealtimeAnalytics = async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [active, pages] = await Promise.all([
      PageViewModel.distinct("sessionId", { timestamp: { $gte: fiveMinAgo } }),
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: fiveMinAgo } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: { activeVisitors: active.length, currentPages: pages },
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/devices   →  auth
// Device / browser / OS breakdown
// ─────────────────────────────────────────────────────────────
export const getDeviceStats = async (req, res) => {
  try {
    const { from, to } = dateRange(req);

    const [devices, browsers, oss] = await Promise.all([
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      PageViewModel.aggregate([
        { $match: { timestamp: { $gte: from, $lte: to } } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({ success: true, data: { devices, browsers, oss } });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/analytics/geo   →  auth
// Country breakdown
// ─────────────────────────────────────────────────────────────
export const getGeoStats = async (req, res) => {
  try {
    const { from, to } = dateRange(req);

    const countries = await PageViewModel.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    return res.status(200).json({ success: true, data: countries });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

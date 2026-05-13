import mongoose from "mongoose";

/**
 * PageView Model — Module 5 Analytics
 * Tracks every public page visit.
 * TTL: auto-delete after 90 days.
 */
const pageViewSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, "Path is required"],
    trim: true,
  },

  referrer: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  ipHash: { type: String, trim: true },   // MD5 hashed IP — privacy safe

  country: { type: String, trim: true },  // geoip-lite
  city: { type: String, trim: true },

  device: {
    type: String,
    enum: ["mobile", "tablet", "desktop", "unknown"],
    default: "unknown",
  },

  browser: { type: String, trim: true },  // ua-parser-js
  os: { type: String, trim: true },

  sessionId: { type: String, trim: true }, // UUID from frontend

  duration: { type: Number, default: 0 },  // Seconds — updated via /api/track/event

  timestamp: { type: Date, default: Date.now },
});

// Compound index for path analytics
pageViewSchema.index({ path: 1, timestamp: -1 });
// Session lookups for duration updates
pageViewSchema.index({ sessionId: 1 });
// TTL index — 90 days (7,776,000 seconds)
pageViewSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 },
);

export const PageViewModel =
  mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);

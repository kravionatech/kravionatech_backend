/**
 * Rate Limiter Middleware
 * Uses express-rate-limit (in-memory, no Redis needed for now).
 * Three tiers:
 *  publicLimiter  → 100 req / 15 min  (all /api routes)
 *  authLimiter    → 20  req / 1 min   (/api/auth routes)
 *  trackLimiter   → 60  req / 1 min   (/api/track routes)
 */

import rateLimit from "express-rate-limit";

const jsonError = (message) => (_req, res) =>
  res.status(429).json({ success: false, message });

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError("Too many requests — please try again later"),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError("Too many auth attempts — please wait a minute"),
});

export const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError("Tracking rate limit exceeded"),
});

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ── Existing Routers ─────────────────────────────────────────
import { userRouter } from "./routes/user.routes.js";
import { messageRouter } from "./routes/messages.routes.js";
import { subscriberRouter } from "./routes/subscriber.routes.js";
import { fileRouter } from "./routes/media.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { postRouter } from "./routes/post.routes.js";

// ── Existing Module Routers (CRM-era, keep working) ─────────
import { serviceRouter } from "./routes/service.routes.js";
import { siteSettingRouter } from "./routes/siteSetting.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { testimonialRouter } from "./routes/testimonial.routes.js";
import { teamRouter } from "./routes/team.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { messagesCRMRouter } from "./routes/messagesCRM.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { auditLogRouter } from "./routes/auditLog.routes.js";
import { emailCampaignRouter } from "./routes/emailCampaign.routes.js";

// ── New dynamization-spec routers (spec §1-§9) ──────────────
import { siteConfigRouter } from "./routes/siteConfig.routes.js";
import { serviceV1Router } from "./routes/serviceV1.routes.js";
import { portfolioV1Router } from "./routes/portfolioV1.routes.js";
import { teamV1Router } from "./routes/teamV1.routes.js";
import { testimonialV1Router } from "./routes/testimonialV1.routes.js";
import { caseStudyV1Router } from "./routes/caseStudyV1.routes.js";
import { pricingV1Router } from "./routes/pricingV1.routes.js";
import { contactV1Router } from "./routes/contactV1.routes.js";

// ── Middleware ───────────────────────────────────────────────
import { publicLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();
// Trust the first proxy hop (Render's load balancer). Using a number
// (or a specific subnet) instead of `true` is required by
// express-rate-limit v8+, which otherwise throws ERR_ERL_PERMISSIVE_TRUST_PROXY.
app.set("trust proxy", 1);

// ── CORS ─────────────────────────────────────────────────────
// Explicit origin allowlist (browsers reject `origin: "*"` with
// `credentials: true` per the CORS spec). Reading from env keeps
// prod (api.kraviona.com) and admin (adminkraviona.vercel.app)
// working without code changes.

const corsOptions = {
  origin: true, // sab origins allow
  credentials: true,
};

// Make sure preflight always succeeds (before any other middleware that
// could throw, e.g. express-mongo-sanitize under Node ≥18).
// Express 5 / path-to-regexp v8 no longer accepts bare "*" as a path —
// use a regex to match everything.
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

// ── Parsers + security primitives ────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ── Lightweight MongoDB operator-injection sanitizer ──────────
// Replaces the old `express-mongo-sanitize@2.x` which throws on
// Node ≥18 (req.query is a getter-only in newer Node). We sanitize
// req.body and req.params in place, and walk req.query's keys
// (which we are allowed to read; we just can't reassign req.query).
// This keeps the no-`$`/no-`.`-prefix guarantee without crashing.
const FORBIDDEN_KEYS = new Set([
  "$where",
  "$expr",
  "$jsonSchema",
  "$function",
]);
const sanitizeValue = (val) => {
  if (val && typeof val === "object") {
    for (const k of Object.keys(val)) {
      if (k.startsWith("$") || k.startsWith(".") || FORBIDDEN_KEYS.has(k)) {
        delete val[k];
      } else {
        sanitizeValue(val[k]);
      }
    }
  }
  return val;
};
app.use((req, _res, next) => {
  try {
    if (req.body) sanitizeValue(req.body);
    if (req.params) sanitizeValue(req.params);
    if (req.query) sanitizeValue(req.query);
  } catch {
    /* never let sanitization break the request */
  }
  next();
});

// Request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ── Rate Limiting ─────────────────────────────────────────────
app.use("/api/auth", authLimiter);
app.use("/api", publicLimiter);

// ── Health check ─────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.status(200).json({ success: true, status: "ok" }),
);

// ── Existing routes (preserved) ──────────────────────────────
app.use("/api", userRouter);
app.use("/api", messageRouter);
app.use("/api", subscriberRouter);
app.use("/api", fileRouter);
app.use("/api", categoriesRouter);
app.use("/api", postRouter);

// ── Existing CRM-era module routes (preserved) ──────────────
app.use("/api", serviceRouter);
app.use("/api", siteSettingRouter);
app.use("/api", projectRouter);
app.use("/api", testimonialRouter);
app.use("/api", teamRouter);
app.use("/api", analyticsRouter);
app.use("/api", messagesCRMRouter);
app.use("/api", notificationRouter);
app.use("/api", auditLogRouter);
app.use("/api", emailCampaignRouter);

// ── New dynamization-spec routes (/api/v1/*) ────────────────
app.use("/api", siteConfigRouter);
app.use("/api", serviceV1Router);
app.use("/api", portfolioV1Router);
app.use("/api", teamV1Router);
app.use("/api", testimonialV1Router);
app.use("/api", caseStudyV1Router);
app.use("/api", pricingV1Router);
app.use("/api", contactV1Router);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// ── Global Error Handler (must be last) ───────────────────────
app.use(errorHandler);
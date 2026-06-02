import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

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
app.set("trust proxy", true);

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ── Parsers + security primitives ────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

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

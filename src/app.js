import express from "express";
import cors from "cors";

// ── Existing Routers ─────────────────────────────────────────
import { userRouter } from "./routes/user.routes.js";
import { messageRouter } from "./routes/messages.routes.js";
import { subscriberRouter } from "./routes/subscriber.routes.js";
import { fileRouter } from "./routes/media.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { postRouter } from "./routes/post.routes.js";

// ── New Module Routers ───────────────────────────────────────
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

// ── Middleware ───────────────────────────────────────────────
import { publicLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();
app.set("trust proxy", true);

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_CORS || "http://localhost:3000",
  process.env.ADMIN_CORS || "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

// ── Rate Limiting ─────────────────────────────────────────────
app.use("/api/auth", authLimiter);  // Strict limiter on auth routes
app.use("/api", publicLimiter);     // General limiter on all API routes
// Note: /api/track uses trackLimiter applied per-route in analytics.routes.js

// ── Existing Routes ───────────────────────────────────────────
app.use("/api", userRouter);
app.use("/api", messageRouter);
app.use("/api", subscriberRouter);
app.use("/api", fileRouter);
app.use("/api", categoriesRouter);
app.use("/api", postRouter);

// ── New Module Routes ─────────────────────────────────────────
app.use("/api", serviceRouter);        // Module 1 — Services
app.use("/api", siteSettingRouter);    // Module 7 — Site Settings
app.use("/api", projectRouter);        // Module 2 — Projects
app.use("/api", testimonialRouter);    // Module 3 — Testimonials
app.use("/api", teamRouter);           // Module 4 — Team
app.use("/api", analyticsRouter);      // Module 5 — Analytics + Tracking
app.use("/api", messagesCRMRouter);    // Module 6 — Messages CRM
app.use("/api", notificationRouter);   // Module 8 — Notifications
app.use("/api", auditLogRouter);       // Module 9 — Audit Logs
app.use("/api", emailCampaignRouter);  // Module 10 — Email Campaigns

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// ── Global Error Handler (must be last) ───────────────────────
app.use(errorHandler);

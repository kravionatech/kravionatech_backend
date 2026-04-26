import mongoose, { Schema, model } from "mongoose";

const sessionSchema = new Schema(
  {
    // 1. KISKA SESSION HAI?
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast query ke liye taaki user ke saare sessions turant fetch ho sakein
    },

    // 2. SECURITY TOKENS
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      select: false, // Security: Query mein directly fetch na ho
    },

    // 3. DEVICE & LOCATION TRACKING (Google jaisa "Where you're logged in" feature)
    deviceInfo: {
      browser: { type: String, trim: true },
      os: { type: String, trim: true },
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
    },
    ipAddress: {
      type: String,
      trim: true,
    },

    // 4. SESSION LIFECYCLE
    loginAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    // 5. REVOCATION (Forced Logout)
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ==========================================
// OPTIMIZATION: TTL Index (Auto-Delete Expired Sessions)
// ==========================================

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel =
  mongoose.models.Session || model("Session", sessionSchema);

import mongoose from "mongoose";

/**
 * AuditLog Model — Module 9
 * Immutable record of all admin actions.
 * TTL: 90 days.
 */
const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  action: {
    type: String,
    required: true,
    trim: true,
    // e.g. CREATE_POST, DELETE_FILE, UPDATE_SETTING, CREATE_SERVICE
    uppercase: true,
  },

  resource: {
    type: String, // e.g. Post, File, Setting, Service
    trim: true,
  },

  resourceId: {
    type: String, // Affected document ID or slug
    trim: true,
  },

  details: {
    type: mongoose.Schema.Types.Mixed, // old/new values
  },

  ip: { type: String, trim: true },
  userAgent: { type: String, trim: true },

  timestamp: { type: Date, default: Date.now },
});

// TTL — 90 days (7,776,000 seconds)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 },
);
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

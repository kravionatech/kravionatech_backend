import mongoose from "mongoose";

/**
 * Notification Model — Module 8
 * Auto-created for admin users on system events.
 * TTL: 30 days.
 */
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "new_message",
      "new_subscriber",
      "post_milestone",
      "campaign_sent",
      "system",
    ],
    required: true,
  },

  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },

  body: { type: String, trim: true },

  link: { type: String, trim: true }, // e.g. /admin/messages/123

  isRead: { type: Boolean, default: false },

  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

// TTL — 30 days (2,592,000 seconds)
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 },
);
notificationSchema.index({ recipient: 1, isRead: 1 });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

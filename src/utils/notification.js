import { NotificationModel } from "../models/Notification.model.js";
import { UserModel } from "../models/user.model.js";

/**
 * Utility: Create notifications for all admin/super_admin users.
 * Safe to call anywhere — swallows its own errors.
 *
 * Usage:
 *   import { createNotification } from "../utils/notification.js";
 *   await createNotification('new_message', 'New Contact', 'From: John', '/admin/messages/123');
 */
export const createNotification = async (type, title, body = "", link = "") => {
  try {
    const admins = await UserModel.find({
      role: { $in: ["admin", "super_admin"] },
    }).select("_id");

    if (!admins.length) return;

    const docs = admins.map((a) => ({
      type,
      title,
      body,
      link,
      recipient: a._id,
    }));

    await NotificationModel.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error("[NOTIFICATION] Failed to create notification:", err.message);
  }
};

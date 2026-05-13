import { NotificationModel } from "../models/Notification.model.js";

// ─────────────────────────────────────────────────────────────
// GET /api/admin/notifications   →  auth (paginated)
// ─────────────────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user?._id || req.user?.id };

    const [data, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments(filter),
    ]);

    const unreadCount = await NotificationModel.countDocuments({
      ...filter,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/notifications/read-all   →  auth
// ─────────────────────────────────────────────────────────────
export const markAllRead = async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { recipient: req.user?._id || req.user?.id, isRead: false },
      { $set: { isRead: true } },
    );
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/notifications/:id/read   →  auth
// ─────────────────────────────────────────────────────────────
export const markOneRead = async (req, res) => {
  try {
    const n = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true },
    );
    if (!n)
      return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: n,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/notifications/:id   →  auth
// ─────────────────────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const n = await NotificationModel.findByIdAndDelete(req.params.id);
    if (!n)
      return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({
      success: true,
      message: "Notification deleted",
      data: n,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

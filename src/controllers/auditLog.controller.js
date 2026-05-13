import { AuditLogModel } from "../models/AuditLog.model.js";

// ─────────────────────────────────────────────────────────────
// GET /api/admin/audit-logs   →  auth+admin
// Query: ?page&limit&userId&resource&from&to
// ─────────────────────────────────────────────────────────────
export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setUTCHours(23, 59, 59, 999);
        filter.timestamp.$lte = to;
      }
    }

    const [data, total] = await Promise.all([
      AuditLogModel.find(filter)
        .populate("user", "name email username")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLogModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/audit-logs/user/:userId   →  auth+admin
// ─────────────────────────────────────────────────────────────
export const getAuditLogsByUser = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AuditLogModel.find({ user: req.params.userId })
        .populate("user", "name email username")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLogModel.countDocuments({ user: req.params.userId }),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

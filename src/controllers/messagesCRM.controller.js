import { MessageModel } from "../models/message.model.js";

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/messages/:id/assign   →  auth
// Body: { userId }  — assign message to a team member
// ─────────────────────────────────────────────────────────────
export const assignMessage = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { userId: ["userId is required"] },
      });
    }

    const message = await MessageModel.findByIdAndUpdate(
      req.params.id,
      { $set: { assignedTo: userId } },
      { new: true },
    ).populate("assignedTo", "name email username");

    if (!message)
      return res.status(404).json({ success: false, message: "Message not found" });

    return res.status(200).json({
      success: true,
      message: "Message assigned successfully",
      data: message,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/admin/messages/:id/note   →  auth
// Body: { text }  — add an internal note
// ─────────────────────────────────────────────────────────────
export const addMessageNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { text: ["Note text is required"] },
      });
    }

    const note = {
      text,
      addedBy: req.user?._id || req.user?.id,
      addedAt: new Date(),
    };

    const message = await MessageModel.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: note } },
      { new: true },
    ).populate("notes.addedBy", "name email username");

    if (!message)
      return res.status(404).json({ success: false, message: "Message not found" });

    return res.status(200).json({
      success: true,
      message: "Note added successfully",
      data: message,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/leads/stats   →  auth
// Returns CRM summary stats
// ─────────────────────────────────────────────────────────────
export const getLeadsStats = async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const [total, statusGroups, thisWeek, closedCount] = await Promise.all([
      MessageModel.countDocuments(),
      MessageModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      MessageModel.countDocuments({ createdAt: { $gte: weekStart } }),
      MessageModel.countDocuments({ status: "closed" }),
    ]);

    const stats = { total: 0, new: 0, contacted: 0, inProgress: 0, closed: 0, spam: 0 };
    stats.total = total;
    statusGroups.forEach(({ _id, count }) => {
      if (_id === "new") stats.new = count;
      else if (_id === "contacted") stats.contacted = count;
      else if (_id === "in-progress") stats.inProgress = count;
      else if (_id === "closed") stats.closed = count;
      else if (_id === "spam") stats.spam = count;
    });
    stats.thisWeek = thisWeek;
    stats.conversionRate =
      total > 0 ? ((closedCount / total) * 100).toFixed(1) + "%" : "0%";

    return res.status(200).json({ success: true, data: stats });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

import { TeamMemberModel } from "../models/TeamMember.model.js";

const listResponse = (res, data, total, page, limit) =>
  res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });

// POST /api/admin/team
export const createTeamMember = async (req, res) => {
  try {
    const member = await TeamMemberModel.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: member,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((f) => {
        errors[f] = [error.errors[f].message];
      });
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/team — published, sorted by order
export const getPublicTeam = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    const [data, total] = await Promise.all([
      TeamMemberModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      TeamMemberModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/team — all members
export const getAdminTeam = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TeamMemberModel.find().sort({ order: 1 }).skip(skip).limit(limit),
      TeamMemberModel.countDocuments(),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/admin/team/:id
export const updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMemberModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!member)
      return res.status(404).json({ success: false, message: "Team member not found" });
    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: member,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid team member ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/admin/team/:id
export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMemberModel.findByIdAndDelete(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: "Team member not found" });
    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
      data: member,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid team member ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

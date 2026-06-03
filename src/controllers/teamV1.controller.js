/**
 * TeamMember controller â€” dynamization spec Â§3.3
 *
 * Public (Redis 5min):
 *   GET /api/v1/public/team
 *   GET /api/v1/public/team/:slug
 *
 * Protected (super_admin):
 *   POST   /api/v1/team
 *   PUT    /api/v1/team/:id
 *   DELETE /api/v1/team/:id
 *   PUT    /api/v1/team/reorder
 */
import { TeamMemberModel } from "../models/TeamMember.model.js";
import slugify from "slugify";
import { invalidateCache } from "../utils/cache.js";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

// GET /api/v1/public/team
export const getPublicTeam = async (_req, res, next) => {
  try {
    const data = await TeamMemberModel.find({ isPublished: true, isActive: true })
      .sort({ order: 1, name: 1 });
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/team  (admin - includes archived/unpublished)
export const getAdminTeam = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isActive === "true") filter.isActive = true;
    if (req.query.isActive === "false") filter.isActive = false;
    if (req.query.isPublished === "true") filter.isPublished = true;
    if (req.query.search) {
      const rx = new RegExp(req.query.search, "i");
      filter.$or = [{ name: rx }, { designation: rx }, { role: rx }, { email: rx }];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      TeamMemberModel.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limit).lean(),
      TeamMemberModel.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      message: "",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/team/:id  (admin - returns archived too)
export const getAdminTeamMemberById = async (req, res, next) => {
  try {
    const doc = await TeamMemberModel.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, data: null, message: "Team member not found" });
    }
    return ok(res, doc);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid team member ID" });
    }
    next(err);
  }
};

// GET /api/v1/public/team/:slug
export const getPublicTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMemberModel.findOne({
      slug: req.params.slug,
      isPublished: true,
      isActive: true,
    });
    if (!member) {
      return res.status(404).json({ success: false, data: null, message: "Team member not found" });
    }
    return ok(res, member);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/team
export const createTeamMember = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    const created = await TeamMemberModel.create(body);
    await invalidateCache("team");
    return res.status(201).json({ success: true, data: created, message: "Team member created" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    next(err);
  }
};

// PUT /api/v1/team/:id
export const updateTeamMember = async (req, res, next) => {
  try {
    const updated = await TeamMemberModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Team member not found" });
    }
    await invalidateCache("team");
    return ok(res, updated, "Team member updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid team member ID" });
    }
    next(err);
  }
};

// DELETE /api/v1/team/:id  â€” soft delete
export const deleteTeamMember = async (req, res, next) => {
  try {
    const updated = await TeamMemberModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false, isPublished: false } },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Team member not found" });
    }
    await invalidateCache("team");
    return ok(res, updated, "Team member archived");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid team member ID" });
    }
    next(err);
  }
};

// PUT /api/v1/team/reorder
export const reorderTeam = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, data: null, message: "order must be a non-empty array" });
    }
    const ops = order.map(({ id, order: o }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: o } } },
    }));
    await TeamMemberModel.bulkWrite(ops);
    await invalidateCache("team");
    return ok(res, null, "Team reordered");
  } catch (err) {
    next(err);
  }
};


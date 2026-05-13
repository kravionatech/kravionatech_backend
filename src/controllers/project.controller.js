import { ProjectModel } from "../models/Project.model.js";
import { ServiceModel } from "../models/service.model.js";
import slugify from "slugify";

const listResponse = (res, data, total, page, limit) =>
  res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });

// ─────────────────────────────────────────────────────────────
// POST /api/admin/projects   →  auth + roleCheck(admin)
// ─────────────────────────────────────────────────────────────
export const createProject = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { title: ["Title is required"] },
      });

    const slug =
      req.body.slug || slugify(title, { lower: true, strict: true });

    const exists = await ProjectModel.findOne({ slug });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Duplicate entry — slug already exists" });

    const project = await ProjectModel.create({ ...req.body, slug });
    return res
      .status(201)
      .json({ success: true, message: "Project created successfully", data: project });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ success: false, message: "Duplicate entry — slug already exists" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/projects   →  Public
// Query: ?category=slug&page&limit
// ─────────────────────────────────────────────────────────────
export const getPublicProjects = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };

    // Filter by service category slug
    if (req.query.category) {
      const svc = await ServiceModel.findOne({ slug: req.query.category }).lean();
      if (svc) filter.serviceCategory = svc._id;
    }

    const [data, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate("serviceCategory", "name slug")
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/project/:slug   →  Public
// ─────────────────────────────────────────────────────────────
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await ProjectModel.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate("serviceCategory", "name slug");

    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    return res.status(200).json({ success: true, data: project });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/projects   →  auth (all)
// ─────────────────────────────────────────────────────────────
export const getAdminProjects = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.isPublished !== undefined)
      filter.isPublished = req.query.isPublished === "true";

    const [data, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate("serviceCategory", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/project/:id   →  auth + roleCheck(admin)
// ─────────────────────────────────────────────────────────────
export const updateProject = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    if (req.body.slug && req.body.slug !== project.slug) {
      const exists = await ProjectModel.findOne({ slug: req.body.slug });
      if (exists)
        return res
          .status(409)
          .json({ success: false, message: "Duplicate entry — slug already exists" });
    }

    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/project/:id   →  auth + roleCheck(admin)
// ─────────────────────────────────────────────────────────────
export const deleteProject = async (req, res) => {
  try {
    const project = await ProjectModel.findByIdAndDelete(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: project,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

import { ServiceModel } from "../models/service.model.js";
import slugify from "slugify";

// ─────────────────────────────────────────────────────────────
// Helper: standard list response
// ─────────────────────────────────────────────────────────────
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
// POST /api/admin/services   →  auth + roleCheck('admin')
// Create a new service
// ─────────────────────────────────────────────────────────────
export const createService = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { name: ["Service name is required"] },
      });
    }

    // Auto-generate slug if not supplied
    const slug =
      req.body.slug || slugify(name, { lower: true, strict: true });

    // Unique slug check
    const exists = await ServiceModel.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry — slug already exists",
      });
    }

    const service = await ServiceModel.create({ ...req.body, slug });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry — slug already exists",
      });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/services   →  Public
// Published services, sorted by order asc
// ─────────────────────────────────────────────────────────────
export const getPublicServices = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };

    const [data, total] = await Promise.all([
      ServiceModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      ServiceModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/service/:slug   →  Public
// Single published service by slug
// ─────────────────────────────────────────────────────────────
export const getServiceBySlug = async (req, res) => {
  try {
    const service = await ServiceModel.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/services   →  auth (all incl. drafts)
// ─────────────────────────────────────────────────────────────
export const getAdminServices = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Optional filter by published status
    const filter = {};
    if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === "true";
    }

    const [data, total] = await Promise.all([
      ServiceModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      ServiceModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/service/:id   →  auth + roleCheck('admin')
// Full update of a service
// ─────────────────────────────────────────────────────────────
export const updateService = async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // If slug is being changed, check uniqueness
    if (req.body.slug && req.body.slug !== service.slug) {
      const slugExists = await ServiceModel.findOne({ slug: req.body.slug });
      if (slugExists) {
        return res.status(409).json({
          success: false,
          message: "Duplicate entry — slug already exists",
        });
      }
    }

    const updated = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid service ID" });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry — slug already exists",
      });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/service/:id   →  auth + roleCheck('admin')
// ─────────────────────────────────────────────────────────────
export const deleteService = async (req, res) => {
  try {
    const service = await ServiceModel.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: service,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid service ID" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/service/:id/order   →  auth + roleCheck('admin')
// Update only the display order (drag-drop reorder)
// Body: { order: Number }
// ─────────────────────────────────────────────────────────────
export const updateServiceOrder = async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined || typeof order !== "number") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { order: ["order must be a number"] },
      });
    }

    const service = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true },
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Service order updated",
      data: service,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid service ID" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

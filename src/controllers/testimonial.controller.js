import { TestimonialModel } from "../models/Testimonial.model.js";

const listResponse = (res, data, total, page, limit) =>
  res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });

// POST /api/admin/testimonials
export const createTestimonial = async (req, res) => {
  try {
    const t = await TestimonialModel.create(req.body);
    return res
      .status(201)
      .json({ success: true, message: "Testimonial created successfully", data: t });
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

// GET /api/testimonials — published only
export const getPublicTestimonials = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.featured === "true") filter.isFeatured = true;

    const [data, total] = await Promise.all([
      TestimonialModel.find(filter)
        .populate("serviceUsed", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TestimonialModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/testimonials — all
export const getAdminTestimonials = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const filter = {};

    const [data, total] = await Promise.all([
      TestimonialModel.find(filter)
        .populate("serviceUsed", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TestimonialModel.countDocuments(filter),
    ]);

    return listResponse(res, data, total, page, limit);
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/admin/testimonial/:id
export const updateTestimonial = async (req, res) => {
  try {
    const t = await TestimonialModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!t)
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: t,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid testimonial ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/admin/testimonial/:id
export const deleteTestimonial = async (req, res) => {
  try {
    const t = await TestimonialModel.findByIdAndDelete(req.params.id);
    if (!t)
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
      data: t,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid testimonial ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Testimonial controller â€” dynamization spec Â§7.2
 *
 * Public (Redis 5min):
 *   GET /api/v1/public/testimonials
 *   GET /api/v1/public/testimonials/featured
 *
 * Protected (super_admin):
 *   POST   /api/v1/testimonials
 *   PUT    /api/v1/testimonials/:id
 *   PUT    /api/v1/testimonials/:id/approve
 *   DELETE /api/v1/testimonials/:id
 */
import { TestimonialModel } from "../models/Testimonial.model.js";
import { invalidateCache } from "../utils/cache.js";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

// GET /api/v1/public/testimonials?showOn=home&featured=true
export const getPublicTestimonials = async (req, res, next) => {
  try {
    const filter = { isPublished: true, isApproved: true };
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.showOn) filter.showOn = req.query.showOn;

    let q = TestimonialModel.find(filter)
      .populate("serviceUsed service projectRef", "title name slug")
      .sort({ order: 1, createdAt: -1 });
    if (req.query.limit) q = q.limit(parseInt(req.query.limit, 10));
    const data = await q.exec();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/testimonials/featured
export const getPublicFeaturedTestimonials = async (req, res, next) => {
  try {
    const filter = { isPublished: true, isApproved: true, isFeatured: true };
    if (req.query.showOn) filter.showOn = req.query.showOn;
    const data = await TestimonialModel.find(filter)
      .populate("serviceUsed service projectRef", "title name slug")
      .sort({ order: 1, createdAt: -1 });
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/testimonials
export const createTestimonial = async (req, res, next) => {
  try {
    const created = await TestimonialModel.create(req.body);
    await invalidateCache("testimonials");
    return res.status(201).json({ success: true, data: created, message: "Testimonial created" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};
      Object.keys(err.errors || {}).forEach((f) => {
        errors[f] = [err.errors[f].message];
      });
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    next(err);
  }
};

// PUT /api/v1/testimonials/:id
export const updateTestimonial = async (req, res, next) => {
  try {
    const updated = await TestimonialModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Testimonial not found" });
    }
    await invalidateCache("testimonials");
    return ok(res, updated, "Testimonial updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid testimonial ID" });
    }
    next(err);
  }
};

// PUT /api/v1/testimonials/:id/approve
export const approveTestimonial = async (req, res, next) => {
  try {
    const body = req.body || {};
    const update = {
      isApproved: body.isApproved !== undefined ? !!body.isApproved : true,
      isPublished:
        body.isPublished !== undefined
          ? !!body.isPublished
          : body.isApproved !== undefined
            ? !!body.isApproved
            : true,
    };
    const updated = await TestimonialModel.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Testimonial not found" });
    }
    await invalidateCache("testimonials");
    return ok(res, updated, `Testimonial ${update.isApproved ? "approved" : "unapproved"}`);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid testimonial ID" });
    }
    next(err);
  }
};

// DELETE /api/v1/testimonials/:id
export const deleteTestimonial = async (req, res, next) => {
  try {
    const deleted = await TestimonialModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: "Testimonial not found" });
    }
    await invalidateCache("testimonials");
    return ok(res, deleted, "Testimonial deleted");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid testimonial ID" });
    }
    next(err);
  }
};


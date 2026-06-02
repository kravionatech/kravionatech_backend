/**
 * CaseStudy controller — dynamization spec §5.2
 *
 * Public:
 *   GET /api/v1/public/case-studies
 *   GET /api/v1/public/case-studies/:slug
 *
 * Protected (super_admin):
 *   POST   /api/v1/case-studies
 *   PUT    /api/v1/case-studies/:id
 *   DELETE /api/v1/case-studies/:id
 */
import { CaseStudyModel } from "../models/CaseStudy.model.js";
import slugify from "slugify";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

// GET /api/v1/public/case-studies
export const getPublicCaseStudies = async (req, res, next) => {
  try {
    const filter = { status: "published" };
    if (req.query.featured === "true") filter.featured = true;
    let q = CaseStudyModel.find(filter)
      .populate("servicesUsed", "title name slug")
      .sort({ publishedAt: -1, order: 1 });
    if (req.query.limit) q = q.limit(parseInt(req.query.limit, 10));
    const data = await q.exec();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/case-studies/:slug
export const getPublicCaseStudyBySlug = async (req, res, next) => {
  try {
    const cs = await CaseStudyModel.findOne({
      slug: req.params.slug,
      status: "published",
    }).populate("servicesUsed", "title name slug");
    if (!cs) {
      return res.status(404).json({ success: false, data: null, message: "Case study not found" });
    }
    return ok(res, cs);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/case-studies
export const createCaseStudy = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) body.slug = slugify(body.title, { lower: true, strict: true });
    const created = await CaseStudyModel.create(body);
    return res.status(201).json({ success: true, data: created, message: "Case study created" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    next(err);
  }
};

// PUT /api/v1/case-studies/:id
export const updateCaseStudy = async (req, res, next) => {
  try {
    const updated = await CaseStudyModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Case study not found" });
    }
    return ok(res, updated, "Case study updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid case study ID" });
    }
    next(err);
  }
};

// DELETE /api/v1/case-studies/:id
export const deleteCaseStudy = async (req, res, next) => {
  try {
    const deleted = await CaseStudyModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: "Case study not found" });
    }
    return ok(res, deleted, "Case study deleted");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid case study ID" });
    }
    next(err);
  }
};

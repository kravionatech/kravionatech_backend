/**
 * Portfolio (Project) controller â€” dynamization spec Â§4.2
 *
 * Public (Redis 5min):
 *   GET /api/v1/public/portfolio
 *   GET /api/v1/public/portfolio/featured
 *   GET /api/v1/public/portfolio/:slug
 *
 * Protected (super_admin):
 *   POST   /api/v1/portfolio
 *   PUT    /api/v1/portfolio/:id
 *   DELETE /api/v1/portfolio/:id
 */
import { ProjectModel } from "../models/Project.model.js";
import slugify from "slugify";
import { invalidateCache } from "../utils/cache.js";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

const activeFilter = () => ({
  isPublished: true,
  isActive: true,
  status: { $ne: "archived" },
});

// GET /api/v1/public/portfolio
export const getPublicPortfolio = async (req, res, next) => {
  try {
    const filter = activeFilter();
    if (req.query.projectType) filter.projectType = req.query.projectType;
    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.featured === "true") filter.isFeatured = true;

    let q = ProjectModel.find(filter)
      .populate("serviceCategory servicesUsed", "title name slug")
      .sort({ isFeatured: -1, completedAt: -1, order: 1 });
    if (req.query.limit) q = q.limit(parseInt(req.query.limit, 10));
    const data = await q.exec();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/portfolio/featured
export const getPublicPortfolioFeatured = async (_req, res, next) => {
  try {
    const data = await ProjectModel.find({ ...activeFilter(), isFeatured: true })
      .populate("serviceCategory servicesUsed", "title name slug")
      .sort({ completedAt: -1, order: 1 })
      .limit(12);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/portfolio/:slug
export const getPublicPortfolioBySlug = async (req, res, next) => {
  try {
    const project = await ProjectModel.findOne({ slug: req.params.slug, ...activeFilter() })
      .populate("serviceCategory servicesUsed", "title name slug");
    if (!project) {
      return res.status(404).json({ success: false, data: null, message: "Project not found" });
    }
    return ok(res, project);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/portfolio
export const createPortfolio = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) body.slug = slugify(body.title, { lower: true, strict: true });
    const exists = await ProjectModel.findOne({ slug: body.slug });
    if (exists) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    const created = await ProjectModel.create(body);
    await invalidateCache("portfolio");
    return res.status(201).json({ success: true, data: created, message: "Project created" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    next(err);
  }
};

// PUT /api/v1/portfolio/:id
export const updatePortfolio = async (req, res, next) => {
  try {
    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Project not found" });
    }
    await invalidateCache("portfolio");
    return ok(res, updated, "Project updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid project ID" });
    }
    next(err);
  }
};

// DELETE /api/v1/portfolio/:id  â€” soft delete
export const deletePortfolio = async (req, res, next) => {
  try {
    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false, isPublished: false, status: "archived" } },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Project not found" });
    }
    await invalidateCache("portfolio");
    return ok(res, updated, "Project archived");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid project ID" });
    }
    next(err);
  }
};


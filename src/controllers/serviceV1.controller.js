/**
 * Service controller â€” dynamization spec Â§2.3
 *
 * Public (cached, Redis 5min / 30min for nav):
 *   GET /api/v1/public/services
 *   GET /api/v1/public/services/nav
 *   GET /api/v1/public/services/:slug
 *
 * Protected (super_admin only):
 *   POST   /api/v1/services
 *   PUT    /api/v1/services/:id
 *   DELETE /api/v1/services/:id
 *   PUT    /api/v1/services/reorder
 */
import { ServiceModel } from "../models/service.model.js";
import slugify from "slugify";
import { invalidateCache } from "../utils/cache.js";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/v1/public/services
// Query: ?category=web-development&featured=true&limit=5
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPublicServices = async (req, res, next) => {
  try {
    const filter = { isPublished: true, isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.isFeatured = true;

    let q = ServiceModel.find(filter).sort({ order: 1, name: 1 });
    if (req.query.limit) q = q.limit(parseInt(req.query.limit, 10));
    const data = await q.exec();

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/v1/public/services/nav
// Returns minimal { _id, title, slug, icon, category } for the
// navigation dropdown.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPublicServicesNav = async (_req, res, next) => {
  try {
    const data = await ServiceModel.find({ isPublished: true, isActive: true })
      .select("title name slug icon category")
      .sort({ order: 1, name: 1 })
      .lean();
    return ok(
      res,
      data.map((s) => ({ ...s, title: s.title || s.name })),
    );
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/v1/public/services/:slug
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPublicServiceBySlug = async (req, res, next) => {
  try {
    const service = await ServiceModel.findOne({
      slug: req.params.slug,
      isPublished: true,
      isActive: true,
    }).populate("relatedServices", "title name slug icon");
    if (!service) {
      return res.status(404).json({ success: false, data: null, message: "Service not found" });
    }
    return ok(res, service);
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// POST /api/v1/services
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const createService = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    if (!body.title && body.name) body.title = body.name;
    const exists = await ServiceModel.findOne({ slug: body.slug });
    if (exists) {
      return res.status(409).json({ success: false, data: null, message: "Service with this slug already exists" });
    }
    const created = await ServiceModel.create(body);
    await invalidateCache("services");
    return res.status(201).json({ success: true, data: created, message: "Service created" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PUT /api/v1/services/:id
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const updateService = async (req, res, next) => {
  try {
    const updated = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Service not found" });
    }
    await invalidateCache("services");
    return ok(res, updated, "Service updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid service ID" });
    }
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DELETE /api/v1/services/:id  â€” soft delete (set isActive=false)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const deleteService = async (req, res, next) => {
  try {
    const updated = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false, isPublished: false } },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Service not found" });
    }
    await invalidateCache("services");
    return ok(res, updated, "Service archived");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid service ID" });
    }
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PUT /api/v1/services/reorder
// Body: { order: [{ id, order }, ...] }
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const reorderServices = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, data: null, message: "order must be a non-empty array" });
    }
    const ops = order.map(({ id, order: o }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: o } } },
    }));
    await ServiceModel.bulkWrite(ops);
    await invalidateCache("services");
    return ok(res, null, "Services reordered");
  } catch (err) {
    next(err);
  }
};


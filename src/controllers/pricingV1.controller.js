/**
 * PricingPlan controller — dynamization spec §6.2
 *
 * Public (Redis 10min):
 *   GET /api/v1/public/pricing
 *
 * Protected (super_admin):
 *   POST   /api/v1/pricing
 *   PUT    /api/v1/pricing/:id
 *   DELETE /api/v1/pricing/:id
 */
import { PricingPlanModel } from "../models/PricingPlan.model.js";
import slugify from "slugify";
import { invalidateCache } from "../utils/cache.js";

const ok = (res, data, message = "") =>
  res.status(200).json({ success: true, data, message });

// GET /api/v1/public/pricing
export const getPublicPricing = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const data = await PricingPlanModel.find(filter).sort({ order: 1, name: 1 });
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/pricing
export const createPricing = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
    const created = await PricingPlanModel.create(body);
    await invalidateCache("pricing");
    return res.status(201).json({ success: true, data: created, message: "Pricing plan created" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, data: null, message: "Duplicate slug" });
    }
    next(err);
  }
};

// PUT /api/v1/pricing/:id
export const updatePricing = async (req, res, next) => {
  try {
    const updated = await PricingPlanModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res.status(404).json({ success: false, data: null, message: "Pricing plan not found" });
    }
    await invalidateCache("pricing");
    return ok(res, updated, "Pricing plan updated");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid pricing plan ID" });
    }
    next(err);
  }
};

// DELETE /api/v1/pricing/:id
export const deletePricing = async (req, res, next) => {
  try {
    const deleted = await PricingPlanModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: "Pricing plan not found" });
    }
    await invalidateCache("pricing");
    return ok(res, deleted, "Pricing plan deleted");
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, data: null, message: "Invalid pricing plan ID" });
    }
    next(err);
  }
};

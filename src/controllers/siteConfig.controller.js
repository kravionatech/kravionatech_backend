/**
 * SiteConfig controller â€” dynamization spec Â§1.2
 *
 * GET  /api/v1/public/site-config  â†’ Public (Redis 10 min)
 * PUT  /api/v1/site-config         â†’ Protected: super_admin
 *
 * The single source of truth for ALL global content.
 * The cache layer (cacheMiddleware) wraps the public GET.
 */
import { SiteConfigModel, SITE_CONFIG_ID } from "../models/SiteConfig.model.js";
import { invalidateCache } from "../utils/cache.js";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Public â€” returns the single SiteConfig doc (or sensible
// defaults if it has never been seeded).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPublicSiteConfig = async (_req, res, next) => {
  try {
    let doc = await SiteConfigModel.findById(SITE_CONFIG_ID).lean();
    if (!doc) {
      // Build a transient default in memory (do NOT persist on read)
      const transient = new SiteConfigModel();
      doc = transient.toObject();
      doc._id = SITE_CONFIG_ID;
    }
    return res.status(200).json({ success: true, data: doc, message: "" });
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Protected â€” upsert the SiteConfig doc, then bust the cache.
// Body is the full SiteConfig shape (partial updates welcome â€”
// the spec only requires super_admin role to call this).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const updateSiteConfig = async (req, res, next) => {
  try {
    const update = { ...req.body, _id: SITE_CONFIG_ID };
    const doc = await SiteConfigModel.findByIdAndUpdate(
      SITE_CONFIG_ID,
      { $set: update },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    // Bust the public cache
    await invalidateCache("site-config");
    return res.status(200).json({
      success: true,
      message: "Site config updated successfully",
      data: doc,
    });
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


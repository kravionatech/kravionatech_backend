import { SiteSettingModel } from "../models/SiteSetting.model.js";

// ─────────────────────────────────────────────────────────────
// GET /api/settings/public   →  Public
// Returns only key + value (no internal metadata)
// ─────────────────────────────────────────────────────────────
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await SiteSettingModel.find({}, "key value").lean();
    // Convert to a flat key:value map for easy frontend consumption
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return res.status(200).json({ success: true, data: map });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/settings   →  auth — all fields
// ─────────────────────────────────────────────────────────────
export const getAllSettings = async (req, res) => {
  try {
    const settings = await SiteSettingModel.find().sort({ group: 1, key: 1 }).lean();
    return res.status(200).json({ success: true, data: settings });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/settings/:group   →  auth — filter by group
// ─────────────────────────────────────────────────────────────
export const getSettingsByGroup = async (req, res) => {
  try {
    const settings = await SiteSettingModel.find({ group: req.params.group })
      .sort({ key: 1 })
      .lean();
    return res.status(200).json({ success: true, data: settings });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/settings   →  auth+admin — Bulk update
// Body: [{ key, value }]
// ─────────────────────────────────────────────────────────────
export const bulkUpdateSettings = async (req, res) => {
  try {
    const updates = req.body; // array of { key, value }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { body: ["Must be a non-empty array of { key, value }"] },
      });
    }

    const ops = updates.map(({ key, value }) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: false,
      },
    }));

    await SiteSettingModel.bulkWrite(ops);

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/settings/:key   →  auth+admin — Single update
// Body: { value }
// ─────────────────────────────────────────────────────────────
export const updateSingleSetting = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { value: ["value is required"] },
      });
    }

    const setting = await SiteSettingModel.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value } },
      { new: true },
    );

    if (!setting) {
      return res.status(404).json({ success: false, message: "Setting not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

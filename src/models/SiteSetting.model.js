import mongoose from "mongoose";

/**
 * SiteSetting Model — Module 7
 * Key-value store for dynamic site configuration.
 * Admins can change any text/image/JSON without redeployment.
 */
const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed, // String | URL | JSON array | Boolean | Number
    },

    type: {
      type: String,
      enum: ["text", "richtext", "image", "json", "boolean", "number"],
      default: "text",
    },

    group: {
      type: String,
      enum: [
        "general",
        "seo",
        "social",
        "homepage",
        "footer",
        "contact",
        "integrations",
      ],
      default: "general",
    },

    label: {
      type: String, // Human-readable name shown in admin UI
      trim: true,
    },

    description: {
      type: String, // Helper hint for admin UI
      trim: true,
    },
  },
  {
    timestamps: true, // updatedAt auto-updated on save
  },
);

siteSettingSchema.index({ key: 1 });
siteSettingSchema.index({ group: 1 });

export const SiteSettingModel =
  mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", siteSettingSchema);

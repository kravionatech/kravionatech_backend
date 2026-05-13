import mongoose from "mongoose";
import slugify from "slugify";

// ──────────────────────────────────────────
// Pricing Plan sub-schema
// ──────────────────────────────────────────
const pricingPlanSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },          // e.g. "Starter", "Pro"
    price: { type: Number },                       // Numeric price
    currency: { type: String, default: "INR", trim: true },
    features: [{ type: String, trim: true }],      // Feature list for this plan
    isPopular: { type: Boolean, default: false },  // Highlight badge
  },
  { _id: false },
);

// ──────────────────────────────────────────
// Main Service Schema
// ──────────────────────────────────────────
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [100, "Name max 100 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // Auto-generated from name if not provided — see pre-save hook below
    },

    shortDesc: {
      type: String,
      trim: true,
      maxlength: [160, "Short description max 160 characters"],
    },

    longDesc: {
      type: String, // Rich text / HTML
      trim: true,
    },

    icon: {
      type: String, // Emoji (🚀) or SVG string
      trim: true,
    },

    coverImage: {
      type: String, // Cloudinary URL
      trim: true,
    },

    features: [{ type: String, trim: true }],  // Feature bullet list

    techStack: [{ type: String, trim: true }], // e.g. ["React", "Node", "MongoDB"]

    pricingPlans: [pricingPlanSchema],

    isFeatured: {
      type: Boolean,
      default: false, // Show on homepage featured section
    },

    isPublished: {
      type: Boolean,
      default: false, // Drafts hidden from public API
    },

    order: {
      type: Number,
      default: 0, // Lower = shown first; supports drag-drop reorder
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Meta title max 100 characters"],
    },

    metaDesc: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description max 160 characters"],
    },
  },
  { timestamps: true },
);

// ──────────────────────────────────────────
// Pre-save: auto-generate slug from name
// ──────────────────────────────────────────
serviceSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// ──────────────────────────────────────────
// Indexes (per guideline)
// ──────────────────────────────────────────
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isPublished: 1, order: 1 });

export const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

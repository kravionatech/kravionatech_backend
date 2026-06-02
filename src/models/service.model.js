import mongoose from "mongoose";
import slugify from "slugify";

// ──────────────────────────────────────────
// Pricing Plan sub-schema (used by old API)
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
// Numbered feature card (Spec §2.1 — "features")
// ──────────────────────────────────────────
const featureCardSchema = new mongoose.Schema(
  {
    number: { type: String, trim: true },          // e.g. "01", "02" — display number
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

// ──────────────────────────────────────────
// Technology chip (Spec §2.1 — "technologies")
// ──────────────────────────────────────────
const technologySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    subtitle: { type: String, trim: true },        // optional helper text
  },
  { _id: false },
);

// ──────────────────────────────────────────
// Service-level FAQ item (Spec §2.1 — "faqs")
// ──────────────────────────────────────────
const serviceFaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

// ──────────────────────────────────────────
// SEO sub-schema (Spec §2.1 — "seo")
// ──────────────────────────────────────────
const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false },
);

// ──────────────────────────────────────────
// Main Service Schema
// ──────────────────────────────────────────
const serviceSchema = new mongoose.Schema(
  {
    // ── Legacy / existing fields (kept) ──────────────────
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

    features: [{ type: String, trim: true }],  // Feature bullet list (legacy)

    techStack: [{ type: String, trim: true }], // e.g. ["React", "Node", "MongoDB"] (legacy)

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

    // ── New fields per dynamization spec §2.1 ─────────────
    // Spec calls the display name "title" — we keep `name` as the
    // canonical field but mirror it for frontend convenience.
    title: { type: String, trim: true },

    // Category enum (spec §2.1)
    category: {
      type: String,
      enum: [
        "web-development",
        "backend-architecture",
        "performance-ai",
        "general",
      ],
      default: "general",
    },

    // "Why Choose" section
    whyChoose: {
      title: { type: String, trim: true, default: "Why Choose" },
      bullets: [{ type: String, trim: true }],
    },

    // Numbered feature cards (spec §2.1 — "features")
    featureCards: [featureCardSchema],

    // Structured technology chips
    technologies: [technologySchema],

    // Service-level FAQ accordion
    faqs: [serviceFaqSchema],

    // References to other Service documents
    relatedServices: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    ],

    // Badge text (e.g. "Most Popular", "Top Rated", "New")
    badge: { type: String, trim: true },

    isPopular: { type: Boolean, default: false },

    // Active flag (spec calls isActive; we keep isPublished as the public
    // filter and use isActive as the soft-delete flag).
    isActive: { type: Boolean, default: true },

    // Full SEO sub-document
    seo: { type: seoSchema, default: () => ({}) },
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
  // Mirror title from name for spec compliance
  if (!this.title) this.title = this.name;
  next();
});

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
serviceSchema.index({ isPublished: 1, isActive: 1, order: 1 });
serviceSchema.index({ isFeatured: 1, isPublished: 1 });

export const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

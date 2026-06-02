import mongoose from "mongoose";
import slugify from "slugify";

/**
 * Project / Portfolio Model — Module 2 (extended per dynamization spec §4.1)
 */

const resultSchema = new mongoose.Schema(
  {
    metric: { type: String, trim: true }, // e.g. "Load Time"
    value: { type: String, trim: true },  // e.g. "1.2s"
    description: { type: String, trim: true }, // optional long-form context
  },
  { _id: false },
);

const testimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, trim: true },
    text: { type: String, trim: true },           // spec alias
    author: { type: String, trim: true },
    authorName: { type: String, trim: true },     // spec alias
    role: { type: String, trim: true },
    designation: { type: String, trim: true },    // spec alias
    company: { type: String, trim: true },
    avatar: {
      url: { type: String, trim: true },
    },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { _id: false },
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    ogImage: { type: String, trim: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    // ── Legacy / existing fields (kept) ──────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    clientName: { type: String, trim: true },
    clientLocation: { type: String, trim: true }, // e.g. "Mumbai, India"

    description: { type: String, trim: true },
    problem: { type: String, trim: true },  // Client's original problem
    solution: { type: String, trim: true }, // What we built

    techStack: [{ type: String, trim: true }],

    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    images: [{ type: String, trim: true }], // Cloudinary URLs (legacy)

    liveUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },

    duration: { type: String, trim: true }, // e.g. "3 months"
    completedAt: { type: Date },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },

    results: [resultSchema],
    testimonial: testimonialSchema,

    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDesc: { type: String, trim: true, maxlength: 160 },

    // ── New fields per dynamization spec §4.1 ─────────────
    client: { type: String, trim: true },                 // spec alias for clientName
    clientLogo: {
      url: { type: String, trim: true },
    },
    industry: { type: String, trim: true, index: true },
    projectType: {
      type: String,
      enum: [
        "web-app",
        "mobile",
        "saas",
        "ecommerce",
        "dashboard",
        "api",
        "other",
      ],
      default: "web-app",
      index: true,
    },
    thumbnail: {
      url: { type: String, trim: true },
      alt: { type: String, trim: true },
    },
    gallery: [imageSchema],                                // spec "images" structured
    challenge: { type: String, trim: true },               // spec — rich text
    challengeRich: { type: String, trim: true },           // rich HTML
    solutionRich: { type: String, trim: true },            // rich HTML
    servicesUsed: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    ],
    technologies: [{ type: String, trim: true }],         // spec alias for techStack
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// Auto-generate slug
projectSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // Mirror shorthand fields for spec compliance
  if (this.clientName && !this.client) this.client = this.clientName;
  if (this.techStack && this.techStack.length && (!this.technologies || !this.technologies.length)) {
    this.technologies = this.techStack;
  }
  next();
});

projectSchema.index({ slug: 1 });
projectSchema.index({ isPublished: 1, isActive: 1, status: 1 });
projectSchema.index({ serviceCategory: 1 });
projectSchema.index({ isFeatured: 1 });

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

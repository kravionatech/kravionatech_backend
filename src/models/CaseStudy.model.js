/**
 * CaseStudy Model — dynamization spec §5
 *
 * /case-studies is currently "Launching Soon" — the model is built
 * here so the page can be populated from the admin panel.
 */
import mongoose from "mongoose";
import slugify from "slugify";

const keyMetricSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    before: { type: String, trim: true },
    after: { type: String, trim: true },
    improvement: { type: String, trim: true },
    icon: { type: String, trim: true },
  },
  { _id: false },
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    keywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true },
  },
  { _id: false },
);

const testimonialSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    authorName: { type: String, trim: true },
    designation: { type: String, trim: true },
    avatar: {
      url: { type: String, trim: true },
      alt: { type: String, trim: true },
    },
  },
  { _id: false },
);

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    client: { type: String, trim: true },
    clientLogo: {
      url: { type: String, trim: true },
    },
    industry: { type: String, trim: true, index: true },
    heroImage: {
      url: { type: String, trim: true },
      alt: { type: String, trim: true },
    },
    tagline: { type: String, trim: true },
    keyMetrics: { type: [keyMetricSchema], default: [] },
    overview: { type: String, trim: true },      // rich HTML
    challenge: { type: String, trim: true },     // rich HTML
    approach: { type: String, trim: true },      // rich HTML
    solution: { type: String, trim: true },      // rich HTML
    results: { type: String, trim: true },       // rich HTML
    servicesUsed: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    ],
    technologies: [{ type: String, trim: true }],
    duration: { type: String, trim: true },
    testimonial: { type: testimonialSchema, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

caseStudySchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

caseStudySchema.index({ slug: 1 });
caseStudySchema.index({ status: 1, publishedAt: -1 });

export const CaseStudyModel =
  mongoose.models.CaseStudy ||
  mongoose.model("CaseStudy", caseStudySchema);

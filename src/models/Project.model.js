import mongoose from "mongoose";
import slugify from "slugify";

/**
 * Project / Portfolio Model — Module 2
 */
const resultSchema = new mongoose.Schema(
  {
    metric: { type: String, trim: true }, // e.g. "Load Time"
    value: { type: String, trim: true },  // e.g. "1.2s"
  },
  { _id: false },
);

const testimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, trim: true },
    author: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
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

    images: [{ type: String, trim: true }], // Cloudinary URLs

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
  },
  { timestamps: true },
);

// Auto-generate slug
projectSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

projectSchema.index({ slug: 1 });
projectSchema.index({ isPublished: 1 });
projectSchema.index({ serviceCategory: 1 });

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

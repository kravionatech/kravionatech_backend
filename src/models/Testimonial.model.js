import mongoose from "mongoose";

/**
 * Testimonial Model — Module 3 (extended per dynamization spec §7.1)
 */

const avatarSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
  },
  { _id: false },
);

const testimonialSchema = new mongoose.Schema(
  {
    // ── Legacy / existing fields (kept) ──────────────────
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    clientRole: { type: String, trim: true },    // e.g. "CTO"
    clientCompany: { type: String, trim: true },
    clientAvatar: { type: String, trim: true },  // Cloudinary URL

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    review: {
      type: String,
      required: [true, "Review is required"],
      trim: true,
    },

    serviceUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    projectRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    // ── New fields per dynamization spec §7.1 ─────────────
    designation: { type: String, trim: true },                  // spec alias for clientRole
    company: { type: String, trim: true },                      // spec alias for clientCompany
    avatar: { type: avatarSchema, default: () => ({}) },        // spec { url, alt }
    showOn: [
      {
        type: String,
        enum: ["home", "gallery", "service", "case-study", "about"],
      },
    ],
    service: {                                                     // spec alias for serviceUsed
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    platform: {
      type: String,
      enum: ["google", "clutch", "linkedin", "direct"],
      default: "direct",
    },
    platformReviewUrl: { type: String, trim: true },
    isApproved: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

testimonialSchema.index({ isPublished: 1 });
testimonialSchema.index({ isFeatured: 1 });
testimonialSchema.index({ isApproved: 1, isFeatured: 1 });

export const TestimonialModel =
  mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);

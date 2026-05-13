import mongoose from "mongoose";

/**
 * Testimonial Model — Module 3
 */
const testimonialSchema = new mongoose.Schema(
  {
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

    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

testimonialSchema.index({ isPublished: 1 });
testimonialSchema.index({ isFeatured: 1 });

export const TestimonialModel =
  mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);

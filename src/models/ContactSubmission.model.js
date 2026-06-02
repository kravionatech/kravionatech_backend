/**
 * ContactSubmission Model — dynamization spec §8
 *
 * Captures every contact form submission from /services, /services/[slug],
 * and /contact pages. Per spec §8.2, every submission ALSO creates a Lead
 * record using the existing Message model.
 */
import mongoose from "mongoose";

const contactSubmissionSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,
    },
    lastName: { type: String, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
    },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true, maxlength: 150 },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 5000,
    },
    sourcePage: { type: String, trim: true },         // e.g. "/services/mern-stack-development"
    sourceService: { type: String, trim: true },      // service slug if from a service page
    utmSource: { type: String, trim: true },
    utmMedium: { type: String, trim: true },
    utmCampaign: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "spam"],
      default: "new",
      index: true,
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    // Reference to the Lead (Message) created from this submission
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

contactSubmissionSchema.index({ createdAt: -1 });
contactSubmissionSchema.index({ status: 1, createdAt: -1 });
contactSubmissionSchema.index({ email: 1 });

export const ContactSubmissionModel =
  mongoose.models.ContactSubmission ||
  mongoose.model("ContactSubmission", contactSubmissionSchema);

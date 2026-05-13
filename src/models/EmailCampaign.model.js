import mongoose from "mongoose";

/**
 * EmailCampaign Model — Module 10
 * Bulk email campaigns to subscribers.
 */
const emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    previewText: { type: String, trim: true }, // Email client preview line

    htmlContent: {
      type: String,
      required: [true, "HTML content is required"],
    },

    textContent: { type: String }, // Plain text fallback

    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },

    scheduledAt: { type: Date },
    sentAt: { type: Date },

    recipients: {
      total: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

emailCampaignSchema.index({ status: 1, scheduledAt: 1 });
emailCampaignSchema.index({ createdBy: 1 });

export const EmailCampaignModel =
  mongoose.models.EmailCampaign ||
  mongoose.model("EmailCampaign", emailCampaignSchema);

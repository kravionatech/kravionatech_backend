import mongoose from "mongoose";

/**
 * PostAnalytics Model — Module 5
 * Daily aggregated analytics per post.
 */
const postAnalyticsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },

  postSlug: { type: String, trim: true }, // Quick lookup without join

  date: { type: Date }, // YYYY-MM-DD — stored as start-of-day UTC

  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  avgReadTime: { type: Number, default: 0 },  // Seconds
  scrollDepth: { type: Number, default: 0 },  // 0-100 %

  reactions: {
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    share: { type: Number, default: 0 },
  },
});

postAnalyticsSchema.index({ postSlug: 1, date: -1 });

export const PostAnalyticsModel =
  mongoose.models.PostAnalytics ||
  mongoose.model("PostAnalytics", postAnalyticsSchema);

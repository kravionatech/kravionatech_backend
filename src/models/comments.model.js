import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. RELATIONS (Kiska comment hai aur kis post par hai)
    // ==========================================
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
      index: true, // Fast searching for fetching comments of a specific post
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null if the user is a guest (not logged in)
    },

    // ==========================================
    // 2. GUEST USER DETAILS (Agar user logged in nahi hai)
    // ==========================================
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true },

    // ==========================================
    // 3. THE COMMENT CONTENT
    // ==========================================
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [1500, "Comment cannot exceed 1500 characters"],
    },

    // ==========================================
    // 4. THREADING (Replies ka system)
    // ==========================================
    // Agar ye kisi aur comment ka reply hai, toh yahan us parent comment ki ID aayegi
    // Agar ye direct post par comment hai, toh ye null rahega
    parentCommentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null,
      index: true,
    },

    // ==========================================
    // 5. MODERATION & SPAM CONTROL
    // ==========================================
    status: {
      type: String,
      enum: ["pending", "approved", "spam", "rejected"],
      default: "pending",
      index: true,
    },

    // ==========================================
    // 6. ENGAGEMENT
    // ==========================================
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false }, // Admin kisi best comment ko top par pin kar sakta hai
  },
  { timestamps: true },
);

// ==========================================
// OPTIMIZATION: Compound Index
// ==========================================
commentSchema.index({ postID: 1, status: 1, parentCommentID: 1 });

export const CommentModel =
  mongoose.models.comment || mongoose.model("comment", commentSchema);

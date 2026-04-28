import mongoose from "mongoose";
import config from "../config/config";

const postSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. CORE CONTENT & TOPICAL CLUSTERING
    // ==========================================
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
      maxlength: [160, "Max 160 characters"],
      minlength: [10, "Min 10 characters"],
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
      index: true,
    },

    // Automate 301 redirects for changed slugs
    previousSlugs: [
      {
        slug: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Min 10 characters"],
      maxlength: [25000, "Max 25000 characters"],
    },

    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxlength: [200, "Max 200 characters"],
      minlength: [10, "Min 10 characters"],
      index: true,
    },

    primaryTopicCluster: { type: String, trim: true, index: true },

    readingTimeMinutes: { type: Number, default: 1 },

    // ==========================================
    // 2. DETAILED AUTHOR & CATEGORY (E-E-A-T)
    // ==========================================
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    author: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      username: { type: String, required: true, trim: true },
      jobTitle: { type: String, trim: true },
      linkedInUrl: { type: String, trim: true },
      avatar: String,
    },

    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    category: {
      name: { type: String, required: true, trim: true },
      slug: { type: String, trim: true },
    },

    // ==========================================
    // 3. ENGAGEMENT METRICS (From your original)
    // ==========================================
    reactions: {
      like: { type: Number, default: 0 },
      dislike: { type: Number, default: 0 },
      share: { type: Number, default: 0 },
    },
    views: { type: Number, default: 0 },

    // ==========================================
    // 4. RESPONSIVE IMAGES & MEDIA
    // ==========================================
    featuredImage: {
      small: {
        url: { type: String, required: true, trim: true },
        altText: { type: String, required: true, trim: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
      medium: {
        url: { type: String, required: true, trim: true },
        altText: { type: String, required: true, trim: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
      large: {
        url: { type: String, required: true, trim: true },
        altText: { type: String, required: true, trim: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
    },

    // Video SEO (For Google Video Tab)
    videoEmbedded: {
      hasVideo: { type: Boolean, default: false },
      videoUrl: { type: String, trim: true },
      thumbnailUrl: { type: String, trim: true },
      name: { type: String, trim: true },
      duration: { type: String, trim: true }, // e.g. "PT5M30S"
    },

    // ==========================================
    // 5. DETAILED TECHNICAL SEO & KEYWORDS
    // ==========================================
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, "SEO titles max 100 chars"],
      default: function () {
        return this.title ? this.title.slice(0, 100) : "";
      },
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO descriptions max 160 chars"],
      default: function () {
        return this.excerpt ? this.excerpt.slice(0, 160) : "";
      },
    },

    keywords: [{ type: String, trim: true }],
    focusKeywords: [{ type: String, trim: true }],
    semanticKeywords: [{ type: String, trim: true }], // LSI Keywords
    canonicalUrl: {
      type: String,
      trim: true,
      default: function () {
        return `${config.BACKENDAPI_CORS}/${this.page}/${this.slug}`;
      },
    },
    isNoIndex: { type: Boolean, default: false },
    isNoFollow: { type: Boolean, default: false },

    // ==========================================
    // 6. SOCIAL CARDS (Open Graph & Twitter)
    // ==========================================
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    twitterTitle: { type: String, trim: true },
    twitterDescription: { type: String, trim: true },

    // ==========================================
    // 7. RICH SNIPPETS (FAQ)
    // ==========================================
    faqSchema: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],

    // ==========================================
    // 8. ENTERPRISE SEO (Google/TechCrunch Level)
    // ==========================================
    // A. Knowledge Graph Entities (Entity Disambiguation)
    knowledgeGraph: {
      about: [
        {
          name: { type: String }, // e.g., "MERN Stack"
          sameAs: { type: String }, // e.g., "https://en.wikipedia.org/wiki/MEAN_(software_bundle)"
        },
      ],
    },

    // B. A/B Testing for Titles (Boost CTR)
    seoTesting: {
      isActive: { type: Boolean, default: false },
      titleVariants: [
        {
          text: { type: String, maxlength: 100 },
          impressions: { type: Number, default: 0 },
          clicks: { type: Number, default: 0 },
        },
      ],
      winningTitleIndex: { type: Number, default: 0 },
    },

    // C. Internal Link Sculpting
    relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],

    // D. Paywall / SGE Access Info
    isAccessibleForFree: { type: Boolean, default: true },

    // ==========================================
    // 9. STATUS, PROVENANCE & GOVERNANCE
    // ==========================================
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },
    page: {
      type: String,
      default: "home",
      enum: ["home", "blog", "service", "about"],
    },

    // Track AI vs Human content (Google 2026 guidelines)
    contentSourceType: {
      type: String,
      enum: ["Human", "AI-Assisted", "AI-Generated"],
      default: "Human",
    },
    lastReviewedAt: { type: Date, default: Date.now },

    // Content Decay Management
    governance: {
      contentScore: { type: Number, min: 0, max: 100 },
      decayStatus: {
        type: String,
        enum: ["Fresh", "Monitoring", "Stale", "Needs Update"],
        default: "Fresh",
      },
      nextReviewDate: { type: Date },
    },

    // ==========================================
    // 10. COMMENT SYSTEM & MODERATION
    // ==========================================
    isCommentEnabled: {
      type: Boolean,
      default: true, // Admin can disable comments for controversial posts
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const PostModel =
  mongoose.models.post || mongoose.model("post", postSchema);

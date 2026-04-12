import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [160, "Max 160 characters"],
      minlength: [10, "Min 10 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Min 10 characters"],
    },

    expert: {
      type: String,
      required: [true, "Expert is required"],
      trim: true,
      maxlength: [160, "Max 160 characters"],
      minlength: [10, "Min 10 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [160, "Max 160 characters"],
      minlength: [10, "Min 10 characters"],
    },
    //  category
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    category: {
      name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        minlength: [3, "Category name must be at least 3 characters long"],
        maxlength: [50, "Category name must be less than 50 characters long"],
      },
      slug: {
        type: String,
      },
    },
    // author
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      name: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
        maxlength: [32, "Author name must be less than 32 characters long"],
      },
      email: {
        type: String,
        required: [true, "Author email is required"],
        trim: true,
        maxlength: [64, "Author email must be less than 64 characters long"],
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Author email must be a valid email address",
        ],
      },
      avatar: String,
      username: {
        type: String,
        required: [true, "Author username is required"],
        trim: true,
        maxlength: [32, "Author username must be less than 32 characters long"],
        match: [
          /^[a-zA-Z0-9_]+$/,
          "Author username can only contain letters, numbers, and underscores",
        ],
      },
    },

    // status
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },

    // thumbnail
    thumbnail: {
      type: String,
      trim: true,
      maxlength: [255, "Thumbnail URL must be less than 255 characters long"],
    },

    // reaction
    reactions: {
      like: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },

      share: {
        type: Number,
        default: 0,
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },

    // seo
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO titles should be under 60 chars"],
      default: function () {
        return this.title;
      },
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO descriptions should be under 160 chars"],
    },
    keywords: [{ type: String }], // Array of strings for tags
    canonicalUrl: String,
    isNoIndex: {
      type: Boolean,
      default: true,
    },
    isNoFollow: {
      type: Boolean,
      default: false,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    ogTitle: {
      type: String,
      trim: true,
    },
    ogDescription: {
      type: String,
      trim: true,
    },
    twitterTitle: {
      type: String,
      trim: true,
    },
    twitterDescription: {
      type: String,
      trim: true,
    },
    twitterImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const PostModel = mongoose.model("post", postSchema);

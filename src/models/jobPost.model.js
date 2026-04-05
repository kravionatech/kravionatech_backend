import mongoose, { Schema, model } from "mongoose";

const JobSchema = new Schema(
  {
    // Job Role

    jobRole: {
      type: String,
      required: [true, "Job Role is required"],
      trim: true,
      unique: true,
      lowercase: true,
      minlength: [3, "Job Role must be at least 3 characters"],
      maxlength: [50, "Job Role must be at most 50 characters"],
      match: [/^[a-zA-Z\s]+$/, "Job Role must contain only letters and spaces"],
    },
    // Description
    jobDescription: {
      type: String,
      required: [true, "Job Description is required"],
      trim: true,
      minlength: [10, "Job Description must be at least 10 characters"],
      maxlength: [1000, "Job Description must be at most 1000 characters"],
    },
    // Sector
    jobSector: {
      type: String,
      required: [true, "Job Sector is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Job Sector must be at least 3 characters"],
      maxlength: [50, "Job Sector must be at most 50 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Job Sector must contain only letters and spaces",
      ],
    },

    // status
    jobStatus: {
      type: String,
      enum: ["open", "closed", "paused"],
      default: "open",
    },
    // company name
    companyName: {
      type: String,
      required: [true, "Company Name is required"],
      trim: true,
      minlength: [2, "Company Name must be at least 2 characters"],
      maxlength: [100, "Company Name must be at most 100 characters"],
      default: "Crossover fintech support private limited",
    },
    // Experience
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
      minlength: [1, "Experience must be at least 1 character"],
      maxlength: [50, "Experience must be at most 50 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Experience must contain only letters and spaces",
      ],
    },
    // level
    jobLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      default: "entry",
    },
    // location
    jobLocation: {
      type: String,
      required: [true, "Job Location is required"],
      trim: true,
      minlength: [2, "Job Location must be at least 2 characters"],
      maxlength: [100, "Job Location must be at most 100 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Job Location must contain only letters and spaces",
      ],
    },
    // pay
    jobPay: {
      type: String,
      required: [true, "Job Pay is required"],
      trim: true,
      minlength: [1, "Job Pay must be at least 1 character"],
      maxlength: [50, "Job Pay must be at most 50 characters"],
      match: [
        /^[a-zA-Z0-9\s]+$/,
        "Job Pay must contain only letters, numbers, and spaces",
      ],
    },
    // mode
    jobMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "remote",
    },

    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorDetails: {
      name: {
        type: String,
        required: [true, "Author Name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Author Email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Author Email is not valid",
        ],
      },

      username: {
        type: String,
        required: [true, "Author Username is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Author Username must be at least 3 characters"],
        maxlength: [30, "Author Username must be at most 30 characters"],
        match: [
          /^[a-zA-Z0-9_]+$/,
          "Author Username must contain only letters, numbers, and underscores",
        ],
      },
    },

    // SEO fields
    metaTitle: {
      type: String,
      trim: true,
      minlength: [3, "Meta Title must be at least 3 characters"],
      maxlength: [60, "Meta Title must be at most 60 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      minlength: [10, "Meta Description must be at least 10 characters"],
      maxlength: [160, "Meta Description must be at most 160 characters"],
    },
    focusKeyword: {
      type: String,
      trim: true,
      minlength: [3, "Focus Keyword must be at least 3 characters"],
      maxlength: [50, "Focus Keyword must be at most 50 characters"],
      match: [
        /^[a-zA-Z0-9\s]+$/,
        "Focus Keyword must contain only letters, numbers, and spaces",
      ],
      default: function () {
        return this.jobRole ? this.jobRole.toLowerCase() : "";
      },
    },
    metaKeywords: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.every((keyword) => /^[a-zA-Z0-9\s]+$/.test(keyword));
        },
        message: "Meta Keywords must contain only letters, numbers, and spaces",
      },
    },
  },
  { timestamps: true },
);

export const JobPostModel = mongoose.model("JobPost", JobSchema);

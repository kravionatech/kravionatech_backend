import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    // ==========================================
    // 1. BASIC INFO (Cleaned & Fixed)
    // ==========================================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "Enter a valid name (alphabets only)",
      ],
      minlength: [3, "Name should be at least 3 characters"],
      maxlength: [50, "Name should be maximum 50 characters"], // Increased slightly for full names
    },

    email: {
      type: String,
      required: [true, "Email ID is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Enter a valid Email ID",
      ],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      minlength: [3, "Username should be at least 3 characters"],
      maxlength: [32, "Username should be maximum 32 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"], // FIXED message
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Enter Mobile Number With Country code"],
    },

    avatar: {
      // FIXED: Removed duplicate
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
      default: "https://api.kraviona.com/avatar.png",
    },

    // ==========================================
    // 2. AUTHENTICATION & SECURITY
    // ==========================================
    password: {
      type: String,
      // Not required IF user signs up via Google/GitHub
      required: function () {
        return !this.googleId && !this.githubId;
      },
      select: false, // Security: Kabhi bhi password by default query mein fetch nahi hoga
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "editor", "author"], // Changed 'creator' to 'author' for standard blog terminology
    },

    isActive: { type: Boolean, default: true },

    // Advanced Security / Brute Force Protection
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },

    // Password Reset System
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ==========================================
    // 3. OAUTH / SOCIAL LOGIN (Future Proofing)
    // ==========================================
    // Agar future mein "Login with Google/GitHub" add karna ho
    authProviders: {
      googleId: { type: String, default: null },
      githubId: { type: String, default: null }, // IT Agency ke liye GitHub login best hai
    },

    // ==========================================
    // 4. VERIFICATION SYSTEM
    // ==========================================
    isVerified: { type: Boolean, default: false }, // FIXED: Removed 'trim' (booleans can't be trimmed)
    verification: {
      emailOtp: { type: String, default: null, select: false },
      emailOtpExpires: {
        type: Date,
        select: false,
        default: function () {
          return new Date(Date.now() + 5 * 60 * 1000);
        },
      },
      phoneOtp: { type: String, default: null, select: false },
      phoneOtpExpires: { type: Date, select: false },
    },

    // ==========================================
    // 5. PUBLIC PROFILE & E-E-A-T (SEO Connection)
    // ==========================================
    // Ye details PostModel ko data feed karengi Google Author Graph ke liye
    profile: {
      bio: { type: String, maxlength: 500, trim: true },
      jobTitle: { type: String, trim: true, maxlength: 100 }, // e.g., "MERN Stack Developer"
      socialLinks: [
        {
          name: {
            type: String,
            trim: true,
            required: [true, "Social platform name is required"],
            minlength: [2, "Platform name must be at least 2 characters"],
            maxlength: [30, "Platform name cannot exceed 30 characters"],
            match: [
              /^[a-zA-Z0-9\s.-]+$/,
              "Platform name can only contain letters, numbers, spaces, dots, and hyphens",
            ],
          },
          url: {
            type: String,
            trim: true,
            required: [true, "Profile URL is required"],
            match: [
              /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
              "Enter a valid URL",
            ],
          },
        },
      ],
    },

    // ==========================================
    // 6. PREFERENCES
    // ==========================================
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// ==========================================
// METHODS & VIRTUALS
// ==========================================

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

export const UserModel = mongoose.models.User || model("User", userSchema);

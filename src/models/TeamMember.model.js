import mongoose from "mongoose";
import slugify from "slugify";

/**
 * TeamMember Model — Module 4 (extended per dynamization spec §3.2)
 */

const avatarSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
  },
  { _id: false },
);

const socialSchema = new mongoose.Schema(
  {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    github: { type: String, trim: true },
  },
  { _id: false },
);

const teamMemberSchema = new mongoose.Schema(
  {
    // ── Legacy / existing fields (kept) ──────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    role: { type: String, trim: true },   // e.g. "Lead Developer"
    bio: { type: String, trim: true },

    avatar: { type: String, trim: true }, // Cloudinary URL (legacy single)

    skills: [{ type: String, trim: true }], // e.g. ["React", "Node", "MongoDB"]

    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    order: { type: Number, default: 0, index: true },
    isPublished: { type: Boolean, default: true, index: true },

    // ── New fields per dynamization spec §3.2 ─────────────
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    designation: { type: String, trim: true },                  // spec alias for role
    avatarObj: { type: avatarSchema, default: () => ({}) },     // spec { url, alt }
    email: { type: String, trim: true, lowercase: true },
    social: { type: socialSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true, index: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Auto-generate slug from name
teamMemberSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Mirror legacy fields for spec compliance
  if (this.role && !this.designation) this.designation = this.role;
  if (this.avatar && !this.avatarObj?.url) {
    this.avatarObj = { url: this.avatar, alt: this.name };
  }
  if (this.socialLinks && Object.keys(this.socialLinks).length && !this.social) {
    this.social = { ...this.socialLinks };
  }
  next();
});

teamMemberSchema.index({ order: 1 });
teamMemberSchema.index({ isPublished: 1, isActive: 1 });

export const TeamMemberModel =
  mongoose.models.TeamMember ||
  mongoose.model("TeamMember", teamMemberSchema);

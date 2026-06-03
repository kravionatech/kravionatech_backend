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

    avatar: { type: avatarSchema, default: () => ({}) }, // { url, alt } — spec avatar shape

    skills: [{ type: String, trim: true }], // e.g. ["React", "Node", "MongoDB"]

    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },

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
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Auto-generate slug from name
teamMemberSchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Mirror legacy fields for spec compliance
  if (this.role && !this.designation) this.designation = this.role;
  // If the legacy `avatar` field was populated as a URL string, mirror it
  // into the spec's `avatarObj` shape. The new shape is already an object.
  if (typeof this.avatar === "string" && this.avatar && !this.avatarObj?.url) {
    this.avatarObj = { url: this.avatar, alt: this.name };
  }
  // Also keep `avatar` populated as the URL string for any legacy readers
  if (this.avatarObj?.url && !this.avatar) {
    this.avatar = this.avatarObj.url;
  }
  if (this.socialLinks && Object.keys(this.socialLinks).length && !this.social) {
    this.social = { ...this.socialLinks };
  }
});

teamMemberSchema.index({ isPublished: 1, isActive: 1 });

export const TeamMemberModel =
  mongoose.models.TeamMember ||
  mongoose.model("TeamMember", teamMemberSchema);

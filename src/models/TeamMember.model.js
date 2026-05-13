import mongoose from "mongoose";

/**
 * TeamMember Model — Module 4
 */
const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    role: { type: String, trim: true },   // e.g. "Lead Developer"
    bio: { type: String, trim: true },

    avatar: { type: String, trim: true }, // Cloudinary URL

    skills: [{ type: String, trim: true }], // e.g. ["React", "Node", "MongoDB"]

    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    order: { type: Number, default: 0 }, // Drag-drop reorder

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

teamMemberSchema.index({ order: 1 });
teamMemberSchema.index({ isPublished: 1 });

export const TeamMemberModel =
  mongoose.models.TeamMember ||
  mongoose.model("TeamMember", teamMemberSchema);

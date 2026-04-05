import mongoose, { Schema, model } from "mongoose";

const InternshipSchema = new mongoose.Schema(
  {
    // Internship Role
    internshipRole: {
      type: String,
      required: [true, "Internship Role is required"],
      trim: true,
      unique: true,
      lowercase: true,
      minlength: [3, "Internship Role must be at least 3 characters"],
      maxlength: [50, "Internship Role must be at most 50 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Internship Role must contain only letters and spaces",
      ],
    },
    // Description
    internshipDescription: {
      type: String,
      required: [true, "Internship Description is required"],
      trim: true,
      minlength: [10, "Internship Description must be at least 10 characters"],
      maxlength: [
        1000,
        "Internship Description must be at most 1000 characters",
      ],
    },
    // Sector
    internshipSector: {
      type: String,
      required: [true, "Internship Sector is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Internship Sector must be at least 3 characters"],
      maxlength: [50, "Internship Sector must be at most 50 characters"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Internship Sector must contain only letters and spaces",
      ],
    },
  },
  { timestamps: true },
);

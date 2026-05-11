import mongoose from "mongoose";
const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: false },

    filename: { type: String, required: true, default: "Untitled" },
    alt: { type: String, default: "Untitled" },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      avatar: String,
    },

    format: {
      type: String,

      enum: [
        "jpg",
        "png",
        "mp4",
        "mp3",
        "wav",
        "avi",
        "mkv",
        "webm",
        "pdf",
        "docx",
        "xlsx",
        "pptx",
        "txt",
        "jpeg",
        "gif",
        "svg",
        "webp",
        "ico",
        "bmp",
        "tiff",
        "psd",
        "ai",
        "eps",
        "indd",
        "raw",
        "heic",
        "flv",
        "mpeg",
        "ogg",
        "opus",
      ],
    },

    size: { type: Number, required: true },
    duration: { type: Number },
  },
  { timestamps: true },
);

export const MediaModel = mongoose.model("Media", mediaSchema);

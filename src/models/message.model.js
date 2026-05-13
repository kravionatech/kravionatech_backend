// mail, name, email, message subject, phone number,

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "Enter a valid name (alphabets only)",
      ],
      minlength: [3, "Name should be at least 3 characters"],
      maxlength: [50, "Name should be maximum 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email ID is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Enter a valid email address",
      ],
      minlength: [3, "Email ID should be at least 3 characters"],
      maxlength: [50, "Email ID should be maximum 50 characters"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [3, "Subject should be at least 3 characters"],
      maxlength: [100, "Subject should be maximum 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message should be at least 10 characters"],
      maxlength: [500, "Message should be maximum 500 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid phone number with country code",
      ],
      minlength: [7, "Phone number should be at least 7 characters"],
      maxlength: [15, "Phone number should be maximum 15 characters"],
    },

    // read status
    isRead: {
      type: Boolean,
      default: false,
    },

    // ──────────────────────────────────────────
    // Module 6 — CRM Enhancement Fields
    // ──────────────────────────────────────────
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    budget: { type: String, trim: true }, // e.g. "₹50k-1L"
    timeline: { type: String, trim: true }, // e.g. "1 month"

    status: {
      type: String,
      enum: ["new", "contacted", "in-progress", "closed", "spam"],
      default: "new",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    source: {
      type: String,
      enum: ["contact-form", "service-page", "blog-cta"],
      default: "contact-form",
    },

    notes: [
      {
        text: { type: String, trim: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],


  },
  {
    timestamps: true,
  },
);

export const MessageModel = mongoose.model("Message", messageSchema);

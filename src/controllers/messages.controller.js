import { MessageModel } from "../models/message.model.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";

// Admin-like roles allowed on the messages admin endpoints
const CRM_ADMIN_ROLES = ["super_admin", "admin", "editor", "viewer"];
const isCrmAdmin = (user) => user && CRM_ADMIN_ROLES.includes(user.role);

// Create a new message from client
// Accepts BOTH the bare { firstName, lastName, ... } shape from API_GUIDE.md
// AND a single { fullname, ... } shape used by older forms.
export const newMessage = async (req, res) => {
  const {
    email,
    phone,
    subject,
    message,
    firstName,
    lastName,
    fullname,          // legacy alias
    budget,
    timeline,
    source,
    service,           // serviceCategory ObjectId
  } = req.body;

  // Build a full name from whichever fields were supplied
  const resolvedFullName =
    (typeof fullname === "string" && fullname.trim()) ||
    `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim();

  // Required-field check (use 400 with field-level errors)
  const errors = {};
  if (!email) errors.email = ["Email is required"];
  if (!phone) errors.phone = ["Phone is required"];
  if (!subject) errors.subject = ["Subject is required"];
  if (!message) errors.message = ["Message is required"];
  if (!resolvedFullName) errors.fullname = ["Name is required"];
  if (Object.keys(errors).length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  try {
    const doc = await MessageModel.create({
      fullname: resolvedFullName,
      email,
      subject,
      message,
      phone,
      budget: budget || undefined,
      timeline: timeline || undefined,
      source: ["contact-form", "service-page", "blog-cta"].includes(source)
        ? source
        : "contact-form",
      service: service || undefined,
    });

    // Confirmation email to the sender (best-effort, do not block on failure)
    try {
      await sendEmail({
        to: email,
        subject: "Message Received - KRAVIONA",
        html: `<p>Dear ${resolvedFullName},</p>
                 <p>Thank you for reaching out to KRAVIONA. We have received your message and will get back to you as soon as possible.</p>
                `,
      });
    } catch (e) {
      console.error("[MESSAGE] client confirmation email failed:", e.message);
    }

    // Notify the support team
    try {
      await sendEmail({
        to: process.env.SUPPORT_EMAIL,
        subject: `New Message from ${resolvedFullName} - KRAVIONA`,
        html: `<p>You have received a new message from the contact form:</p>
                  <p><strong>Name:</strong> ${resolvedFullName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Message:</strong> ${message}</p>
                  ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ""}
                  ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ""}
                `,
      });
    } catch (e) {
      console.error("[MESSAGE] support email failed:", e.message);
    }

    // Fan-out notification to all admins
    await createNotification(
      "new_message",
      "New Contact Form Message",
      `From: ${resolvedFullName} (${email})`,
      `/admin/messages/${doc._id}`,
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { id: doc._id },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const fieldErrors = {};
      Object.keys(error.errors || {}).forEach((f) => {
        fieldErrors[f] = [error.errors[f].message];
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// List all messages â€” paginated, with optional status / source filter
export const getAllMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (!isCrmAdmin(user)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === "true";
    }

    const [messages, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MessageModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Update message status / isRead
// Body: { isRead?: boolean, status?: "new|contacted|in-progress|closed|spam" }
export const updateMessageStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (!isCrmAdmin(user)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    const { id } = req.params;
    const { isRead, status } = req.body;

    const update = {};
    if (typeof isRead === "boolean") update.isRead = isRead;
    if (status) {
      const allowed = ["new", "contacted", "in-progress", "closed", "spam"];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: { status: [`Must be one of: ${allowed.join(", ")}`] },
        });
      }
      update.status = status;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updatable fields supplied",
      });
    }

    const message = await MessageModel.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    });

    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    return res
      .status(500)
      .json({
        error: "Internal server error",
        details: error.message,
        success: false,
      });
  }
};

// Get a single message and auto-mark as read
export const readMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (!isCrmAdmin(user)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    const { id } = req.params;

    const message = await MessageModel.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { returnDocument: "after" },
    );
    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Delete a message (admin only)
export const deleteMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isCrmAdmin(user)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const { id } = req.params;

    const message = await MessageModel.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
      message: "Message deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


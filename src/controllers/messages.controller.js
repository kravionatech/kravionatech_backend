import { MessageModel } from "../models/message.model.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail } from "../utils/email.js";

// Create a new message from client
export const newMessage = async (req, res) => {
  // Extract user data from request body
  const { email, phone, subject, message, firstName, lastName } = req.body;

  // ---------------------------------------
  // Check for empty required fields
  // ---------------------------------------
  const requiredField = { email, firstName, lastName, phone, subject, message };

  for (let [key, value] of Object.entries(requiredField)) {
    if (!value) {
      return res.status(400).json({
        success: false,
        message: `${key.toUpperCase()} is required`,
      });
    }
  }
  try {
    const fullName = `${firstName} ${lastName}`;

    const newMessage = new MessageModel({
      fullname: fullName,
      email,
      subject,
      message,
      phone,
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "Message Received - KRAVIONA",
      html: `<p>Dear ${fullName},</p>
               <p>Thank you for reaching out to KRAVIONA. We have received your message and will get back to you as soon as possible.</p>
              `,
    });

    // Send email to support team with message details
    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      subject: `New Message from ${fullName} - KRAVIONA`,
      html: `<p>You have received a new message from the contact form:</p>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>
              `,
    });
    await newMessage.save();
    return res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Mark message as read (admin only)
export const getAllMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await UserModel.findById(req?.user?.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = await MessageModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total: await MessageModel.countDocuments(),
        page,
        limit,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// update message read status
export const updateMessageStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await UserModel.findById(req?.user?.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    const { id } = req.params;
    const { isRead } = req.body;

    const message = await MessageModel.findByIdAndUpdate(
      id,
      { isRead },
      { new: true },
    );

    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: "Internal server error",
        details: error.message,
        success: false,
      });
  }
};

// Mark message as read
export const readMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req?.user?.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access denied", success: false });
    }

    const { id } = req.params;

    const message = await MessageModel.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    message.isRead = true;
    await message.save();

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
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

    const user = await UserModel.findById(req?.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "super_admin") {
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
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

/**
 * Public Contact controller — dynamization spec §8
 *
 * POST /api/v1/public/contact
 *
 * Workflow (spec §8.2):
 *  1. Save to ContactSubmission collection
 *  2. Create a Lead record using the existing Message model
 *  3. Send notification email to kravionatech@gmail.com
 *  4. Send auto-reply email to the submitter
 *
 * All email sends are best-effort — never block the response.
 */
import { ContactSubmissionModel } from "../models/ContactSubmission.model.js";
import { MessageModel } from "../models/message.model.js";
import { sendEmail } from "../utils/email.js";

const SUPPORT_INBOX =
  process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || "kravionatech@gmail.com";

export const submitContact = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      sourcePage,
      sourceService,
      utmSource,
      utmMedium,
      utmCampaign,
    } = req.body || {};

    // Validation
    const errors = {};
    if (!firstName || String(firstName).trim().length < 1) {
      errors.firstName = ["First name is required"];
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = ["Valid email is required"];
    }
    if (!message || String(message).trim().length < 5) {
      errors.message = ["Message is required (min 5 chars)"];
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || firstName;

    const ipAddress =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip;
    const userAgent = (req.headers["user-agent"] || "").toString().slice(0, 500);

    // 1. Save ContactSubmission
    const submission = await ContactSubmissionModel.create({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      sourcePage,
      sourceService,
      utmSource,
      utmMedium,
      utmCampaign,
      status: "new",
      ipAddress,
      userAgent,
    });

    // 2. Create a Lead (Message) record
    let lead = null;
    try {
      lead = await MessageModel.create({
        fullname: fullName,
        email,
        phone: phone || "+910000000000",   // satisfy required; phone is optional on form
        subject: subject || "Contact form submission",
        message,
        source: sourceService ? "service-page" : "contact-form",
      });
      submission.leadId = lead._id;
      await submission.save();
    } catch (e) {
      // Don't fail the response if Lead creation fails
      console.error("[CONTACT] lead creation failed:", e.message);
    }

    // 3. Notify the support team
    try {
      await sendEmail({
        to: SUPPORT_INBOX,
        subject: `New contact form submission from ${fullName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
          <p><strong>Source page:</strong> ${sourcePage || "(unknown)"}</p>
          ${sourceService ? `<p><strong>Service:</strong> ${sourceService}</p>` : ""}
          <hr />
          <p>${message.replace(/\n/g, "<br />")}</p>
        `,
      });
    } catch (e) {
      console.error("[CONTACT] support email failed:", e.message);
    }

    // 4. Auto-reply to the submitter
    try {
      await sendEmail({
        to: email,
        subject: "Thanks for contacting Kraviona",
        html: `
          <p>Hi ${fullName},</p>
          <p>Thank you for reaching out to <strong>Kraviona Tech Solutions</strong>.
             We have received your message and our team will get back to you within 24 hours.</p>
          <p>For your reference, here's what we received:</p>
          <blockquote>${message.replace(/\n/g, "<br />")}</blockquote>
          <p>— The Kraviona Team</p>
        `,
      });
    } catch (e) {
      console.error("[CONTACT] auto-reply failed:", e.message);
    }

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received.",
      data: { id: submission._id, leadId: lead?._id },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};
      Object.keys(err.errors || {}).forEach((f) => {
        errors[f] = [err.errors[f].message];
      });
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    next(err);
  }
};

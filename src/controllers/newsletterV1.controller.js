/**
 * Public Newsletter controller — dynamization spec §9
 *
 * POST /api/v1/public/newsletter/subscribe
 *
 * Workflow (spec §9.2):
 *  1. Check if email already exists in Subscriber collection
 *  2. If duplicate: return 200 with message "Already subscribed!"
 *  3. If new: save to Subscriber collection, send welcome email, return success
 */
import { SubscriberModel } from "../models/subscriber.model.js";
import { sendEmail, SubscriberWelcomeEmail } from "../utils/email.js";

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { email: ["Valid email is required"] },
      });
    }

    const existing = await SubscriberModel.findOne({ email: email.toLowerCase() }).select("email status");
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed!",
        data: { email: existing.email, status: existing.status, alreadySubscribed: true },
      });
    }

    const sub = await SubscriberModel.create({
      email: email.toLowerCase(),
      status: "subscriber",
    });

    // Best-effort welcome email
    try {
      await sendEmail({
        to: sub.email,
        subject: "Welcome to the Kraviona newsletter",
        html: SubscriberWelcomeEmail({ email: sub.email }),
      });
    } catch (e) {
      console.error("[NEWSLETTER] welcome email failed:", e.message);
    }

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: { email: sub.email, status: sub.status, alreadySubscribed: false },
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

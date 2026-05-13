import { EmailCampaignModel } from "../models/EmailCampaign.model.js";
import { SubscriberModel } from "../models/subscriber.model.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";

// ─────────────────────────────────────────────────────────────
// POST /api/admin/campaigns   →  auth+admin — create draft
// ─────────────────────────────────────────────────────────────
export const createCampaign = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;
    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: {
          ...((!subject) && { subject: ["Subject is required"] }),
          ...((!htmlContent) && { htmlContent: ["HTML content is required"] }),
        },
      });
    }

    const campaign = await EmailCampaignModel.create({
      ...req.body,
      status: "draft",
      createdBy: req.user?._id || req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/campaigns   →  auth — list all
// ─────────────────────────────────────────────────────────────
export const getCampaigns = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EmailCampaignModel.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EmailCampaignModel.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (_e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/admin/campaign/:id   →  auth — detail with stats
// ─────────────────────────────────────────────────────────────
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await EmailCampaignModel.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    return res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/campaign/:id   →  auth+admin — edit draft
// ─────────────────────────────────────────────────────────────
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaignModel.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be edited",
      });
    }

    const updated = await EmailCampaignModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/campaign/:id   →  auth+admin — draft only
// ─────────────────────────────────────────────────────────────
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaignModel.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be deleted",
      });
    }

    await campaign.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
      data: campaign,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/admin/campaign/:id/send   →  auth+admin
// Send immediately to all active subscribers
// ─────────────────────────────────────────────────────────────
export const sendCampaign = async (req, res) => {
  try {
    const campaign = await EmailCampaignModel.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    if (!["draft", "failed"].includes(campaign.status)) {
      return res.status(400).json({
        success: false,
        message: `Campaign is already ${campaign.status}`,
      });
    }

    // Mark as sending
    campaign.status = "sending";
    await campaign.save();

    // Get subscriber list
    const subscribers = await SubscriberModel.find({ isActive: true }).select("email").lean();
    const total = subscribers.length;

    // Send emails (fire-and-forget — update stats after)
    let delivered = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: campaign.subject,
          html: campaign.htmlContent,
          text: campaign.textContent,
        });
        delivered++;
      } catch (_) {
        // Continue on individual failure
      }
    }

    campaign.status = "sent";
    campaign.sentAt = new Date();
    campaign.recipients = { total, delivered, opened: 0, clicked: 0, bounced: total - delivered };
    await campaign.save();

    // Notify admins
    await createNotification(
      "campaign_sent",
      `Campaign Sent: ${campaign.subject}`,
      `Delivered to ${delivered}/${total} subscribers`,
      `/admin/campaigns/${campaign._id}`,
    );

    return res.status(200).json({
      success: true,
      message: `Campaign sent to ${delivered}/${total} subscribers`,
      data: campaign,
    });
  } catch (error) {
    // Mark as failed on error
    await EmailCampaignModel.findByIdAndUpdate(req.params.id, { status: "failed" }).catch(() => {});
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/admin/campaign/:id/schedule   →  auth+admin
// Body: { scheduledAt }
// ─────────────────────────────────────────────────────────────
export const scheduleCampaign = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { scheduledAt: ["scheduledAt is required"] },
      });
    }

    const campaign = await EmailCampaignModel.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be scheduled",
      });
    }

    const schedDate = new Date(scheduledAt);
    if (schedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt must be in the future",
      });
    }

    campaign.status = "scheduled";
    campaign.scheduledAt = schedDate;
    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign scheduled successfully",
      data: campaign,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

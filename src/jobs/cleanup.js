/**
 * Background Cron Jobs — jobs/cleanup.js
 *
 * Job 1 "0 2 * * *"   — 2am daily: delete PageViews older than 90 days
 * Job 2 "every 5 min" — check and send scheduled campaigns
 *
 * Call startCronJobs() from server.js after DB connection.
 */

import cron from "node-cron";
import { PageViewModel } from "../models/PageView.model.js";
import { EmailCampaignModel } from "../models/EmailCampaign.model.js";
import { SubscriberModel } from "../models/subscriber.model.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";

// ─────────────────────────────────────────────────────────────
// Job 1: Clean up old PageViews (belt-and-suspenders over TTL index)
// ─────────────────────────────────────────────────────────────
const cleanupPageViews = async () => {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await PageViewModel.deleteMany({
      timestamp: { $lt: cutoff },
    });
    if (result.deletedCount > 0) {
      console.log(`[CRON] Cleaned ${result.deletedCount} old PageViews`);
    }
  } catch (err) {
    console.error("[CRON] PageView cleanup failed:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// Job 2: Send scheduled campaigns that have passed their scheduledAt
// ─────────────────────────────────────────────────────────────
const sendScheduledCampaigns = async () => {
  try {
    const due = await EmailCampaignModel.find({
      status: "scheduled",
      scheduledAt: { $lte: new Date() },
    });

    for (const campaign of due) {
      campaign.status = "sending";
      await campaign.save();

      const subscribers = await SubscriberModel.find({ isActive: true })
        .select("email")
        .lean();
      const total = subscribers.length;
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
        } catch (_) {}
      }

      campaign.status = "sent";
      campaign.sentAt = new Date();
      campaign.recipients = {
        total,
        delivered,
        opened: 0,
        clicked: 0,
        bounced: total - delivered,
      };
      await campaign.save();

      await createNotification(
        "campaign_sent",
        `Scheduled Campaign Sent: ${campaign.subject}`,
        `Delivered to ${delivered}/${total} subscribers`,
        `/admin/campaigns/${campaign._id}`,
      );

      console.log(`[CRON] Scheduled campaign "${campaign.subject}" sent to ${delivered}/${total}`);
    }
  } catch (err) {
    console.error("[CRON] Scheduled campaign send failed:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// Start all cron jobs
// ─────────────────────────────────────────────────────────────
export const startCronJobs = () => {
  // 2am daily cleanup
  cron.schedule("0 2 * * *", cleanupPageViews, {
    timezone: "Asia/Kolkata",
  });

  // Every 5 minutes — check scheduled campaigns
  cron.schedule("*/5 * * * *", sendScheduledCampaigns);

  console.log("[CRON] Jobs started: cleanup@2am, campaigns@*/5min");
};

/**
 * PricingPlan Model — dynamization spec §6
 *
 * /pricing is currently "Coming Soon". The isComingSoon flag in
 * SiteConfig.pricing controls whether the frontend renders plans
 * or the placeholder. Plans live in this collection.
 */
import mongoose from "mongoose";
import slugify from "slugify";

const priceSchema = new mongoose.Schema(
  {
    monthly: { type: Number },
    quarterly: { type: Number },
    yearly: { type: Number },
    currency: { type: String, default: "INR", trim: true },
    suffix: { type: String, trim: true, default: "/month" },
    isCustom: { type: Boolean, default: false },
  },
  { _id: false },
);

const ctaSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, default: "Get Started" },
    link: { type: String, trim: true, default: "/contact" },
  },
  { _id: false },
);

const featureSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    included: { type: Boolean, default: true },
    tooltip: { type: String, trim: true },
  },
  { _id: false },
);

const pricingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    tagline: { type: String, trim: true },
    price: { type: priceSchema, default: () => ({}) },
    category: {
      type: String,
      enum: ["web-development", "seo", "maintenance", "custom"],
      default: "web-development",
    },
    isPopular: { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false },
    features: { type: [featureSchema], default: [] },
    cta: { type: ctaSchema, default: () => ({}) },
    deliverables: [{ type: String, trim: true }],
    idealFor: { type: String, trim: true },
    timeframe: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

pricingPlanSchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

pricingPlanSchema.index({ isActive: 1, order: 1 });

export const PricingPlanModel =
  mongoose.models.PricingPlan ||
  mongoose.model("PricingPlan", pricingPlanSchema);

/**
 * SiteConfig Model — dynamization spec §1
 *
 * A SINGLE MongoDB document holding every global piece of content
 * that the frontend currently has hardcoded: hero copy, stats, whyUs,
 * whoWeAre, techStack, home FAQs, newsletter, footer, about page,
 * pricing toggle, and SEO defaults.
 *
 * We always upsert against a fixed _id so the seed script is idempotent.
 */
import mongoose from "mongoose";

const FIXED_ID = "kraviona_site_config_v1";

const socialSchema = new mongoose.Schema(
  {
    facebook: { type: String, trim: true, default: "https://facebook.com/kraviona" },
    twitter: { type: String, trim: true, default: "https://twitter.com/kraviona" },
    linkedin: { type: String, trim: true, default: "https://linkedin.com/company/kraviona" },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
  },
  { _id: false },
);

const ctaSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    link: { type: String, trim: true },
  },
  { _id: false },
);

const whyFeatureSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true },        // emoji or SVG string
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const techToolSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    proficiency: { type: Number, default: 80 },
    yearsUsed: { type: Number, default: 1 },
    isPrimary: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { _id: false },
);

const techStackCategorySchema = new mongoose.Schema(
  {
    category: { type: String, trim: true },    // e.g. "Frontend"
    categoryTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    tools: [techToolSchema],
  },
  { _id: false },
);

const homeFaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    href: { type: String, trim: true },
  },
  { _id: false },
);

const aboutValueSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
  },
  { _id: false },
);

const pricingConfigSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "Pricing" },
    subtitle: { type: String, trim: true },
    disclaimer: { type: String, trim: true },
    billingToggle: { type: Boolean, default: true },
    isComingSoon: { type: Boolean, default: true },
  },
  { _id: false },
);

const siteConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: FIXED_ID },

    // ── Company Info (spec §1.1) ──────────────────────────
    companyName: { type: String, trim: true, default: "Kraviona Tech Solutions" },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 150 },
    phone: { type: String, trim: true, default: "+91 9608553167" },
    email: { type: String, trim: true, default: "kravionatech@gmail.com" },
    address: { type: String, trim: true, default: "East Delhi, India 110092" },

    // ── Social Links ──────────────────────────────────────
    social: { type: socialSchema, default: () => ({}) },

    // ── Homepage Hero ─────────────────────────────────────
    hero: {
      badge1: { type: String, trim: true, default: "⚡SEO Optimized" },
      badge2: { type: String, trim: true, default: "🚀MERN Stack Experts" },
      badge3: { type: String, trim: true, default: "✅Fast Delivery" },
      headline: {
        type: String,
        trim: true,
        default: "MERN Stack Development & Technical SEO Solutions",
      },
      subheadline: { type: String, trim: true },
      ctaPrimary: { type: ctaSchema, default: () => ({}) },
      ctaSecondary: { type: ctaSchema, default: () => ({}) },
      phone: { type: String, trim: true },
    },

    // ── Global Stats ──────────────────────────────────────
    stats: {
      projectsDelivered: { type: String, trim: true, default: "150+" },
      clientRetention: { type: String, trim: true, default: "99%" },
      yearsExperience: { type: String, trim: true, default: "5+" },
      support: { type: String, trim: true, default: "24/7" },
      projectsLabel: { type: String, trim: true, default: "Projects Delivered" },
      retentionLabel: { type: String, trim: true, default: "Client Retention Rate" },
      experienceLabel: { type: String, trim: true, default: "Years of Experience" },
      supportLabel: { type: String, trim: true, default: "Post-Launch Support" },
    },

    // ── "Why Kraviona" Section ────────────────────────────
    whyUs: {
      title: { type: String, trim: true, default: "Why Kraviona" },
      subtitle: { type: String, trim: true },
      features: { type: [whyFeatureSchema], default: [] },
    },

    // ── "Who We Are" Section ──────────────────────────────
    whoWeAre: {
      title: { type: String, trim: true, default: "Who We Are" },
      description: { type: String, trim: true },
      ctaText: { type: String, trim: true },
      ctaLink: { type: String, trim: true },
    },

    // ── Tech Stack Section ───────────────────────────────
    techStack: { type: [techStackCategorySchema], default: [] },

    // ── Homepage FAQs ─────────────────────────────────────
    homeFaqs: { type: [homeFaqSchema], default: [] },

    // ── Newsletter Section ────────────────────────────────
    newsletter: {
      title: { type: String, trim: true, default: "Subscribe to our newsletter" },
      subtitle: { type: String, trim: true },
      placeholder: { type: String, trim: true, default: "Enter your email" },
    },

    // ── Footer Section ────────────────────────────────────
    footer: {
      description: { type: String, trim: true },
      capabilitiesLinks: { type: [footerLinkSchema], default: [] },
      companyLinks: { type: [footerLinkSchema], default: [] },
      copyrightText: {
        type: String,
        trim: true,
        default: `© ${new Date().getFullYear()} Kraviona Tech Solutions. All rights reserved.`,
      },
    },

    // ── About Page Extension ──────────────────────────────
    about: {
      heroTitle: {
        type: String,
        trim: true,
        default: "We engineer digital ecosystems that scale.",
      },
      heroSubtitle: { type: String, trim: true },
      storyTitle: { type: String, trim: true, default: "Our Story" },
      storyContent: { type: String, trim: true },
      storyQuote: {
        type: String,
        trim: true,
        default: "We don't just write code; we solve complex business problems.",
      },
      values: { type: [aboutValueSchema], default: [] },
      ctaTitle: { type: String, trim: true },
      ctaSubtitle: { type: String, trim: true },
    },

    // ── Pricing Config (toggle, not the plans themselves) ─
    pricing: { type: pricingConfigSchema, default: () => ({}) },

    // ── Analytics & SEO ───────────────────────────────────
    googleAnalyticsId: { type: String, trim: true, default: "GTM-5LX2JWGD" },
    googleVerification: { type: String, trim: true },
    defaultMetaTitle: { type: String, trim: true, default: "Kraviona Tech Solutions" },
    defaultMetaDescription: { type: String, trim: true },
    defaultOgImage: { type: String, trim: true, default: "/og-image.jpg" },
  },
  { timestamps: true, _id: false },
);

export const SiteConfigModel =
  mongoose.models.SiteConfig ||
  mongoose.model("SiteConfig", siteConfigSchema);

export { FIXED_ID as SITE_CONFIG_ID };

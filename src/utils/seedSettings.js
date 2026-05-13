import { SiteSettingModel } from "../models/SiteSetting.model.js";

/**
 * seedSettings — run once on server start.
 * Inserts default settings using updateOne with upsert:true
 * so it NEVER overwrites values that have already been set by an admin.
 */
const DEFAULT_SETTINGS = [
  // General
  { key: "site_name",     value: "Kraviona Tech",   type: "text",    group: "general",  label: "Site Name",          description: "The name of the website" },
  { key: "site_tagline",  value: "Build. Launch. Grow.",type: "text", group: "general",  label: "Site Tagline",       description: "Short tagline shown in header/SEO" },
  { key: "site_logo",     value: "",                type: "image",   group: "general",  label: "Site Logo",          description: "Cloudinary URL of main logo" },
  { key: "site_favicon",  value: "",                type: "image",   group: "general",  label: "Favicon",            description: "Browser tab icon URL" },

  // Homepage
  { key: "hero_headline",    value: "We Build Digital Products",type: "text",  group: "homepage", label: "Hero Headline",      description: "Main heading on home page" },
  { key: "hero_subheadline", value: "From idea to launch.",     type: "text",  group: "homepage", label: "Hero Sub-Headline",  description: "Sub-line below main heading" },
  { key: "hero_cta_text",    value: "Get Started",              type: "text",  group: "homepage", label: "CTA Button Text",    description: "Call-to-action button label" },
  { key: "hero_cta_link",    value: "/contact",                 type: "text",  group: "homepage", label: "CTA Button Link",    description: "Call-to-action button destination" },
  { key: "about_text",       value: "",                         type: "richtext",group:"homepage", label: "About Section Text", description: "Homepage about section content" },
  { key: "about_image",      value: "",                         type: "image", group: "homepage", label: "About Section Image",description: "Cloudinary URL for about section" },

  // Contact
  { key: "contact_email",   value: "",  type: "text",  group: "contact", label: "Contact Email",   description: "Public contact email address" },
  { key: "contact_phone",   value: "",  type: "text",  group: "contact", label: "Contact Phone",   description: "Public contact phone number" },
  { key: "contact_address", value: "",  type: "text",  group: "contact", label: "Office Address",  description: "Physical address shown on contact page" },

  // Social
  { key: "social_linkedin",  value: "", type: "text",  group: "social",  label: "LinkedIn URL",    description: "" },
  { key: "social_github",    value: "", type: "text",  group: "social",  label: "GitHub URL",      description: "" },
  { key: "social_twitter",   value: "", type: "text",  group: "social",  label: "Twitter/X URL",   description: "" },
  { key: "social_instagram", value: "", type: "text",  group: "social",  label: "Instagram URL",   description: "" },

  // SEO
  { key: "seo_title",       value: "Kraviona Tech — IT Services", type: "text",  group: "seo", label: "Default SEO Title",       description: "Fallback title tag for all pages" },
  { key: "seo_description", value: "",                            type: "text",  group: "seo", label: "Default Meta Description",description: "Fallback meta description" },
  { key: "seo_og_image",    value: "",                            type: "image", group: "seo", label: "Default OG Image",        description: "Default Open Graph image (1200x630)" },

  // Footer
  { key: "footer_copyright", value: `© ${new Date().getFullYear()} Kraviona Tech. All rights reserved.`, type: "text", group: "footer", label: "Copyright Text", description: "" },
  { key: "footer_links",     value: [],                                                                   type: "json", group: "footer", label: "Footer Links",   description: "JSON array of { label, href } objects" },

  // Integrations
  { key: "ga_id",       value: "", type: "text", group: "integrations", label: "Google Analytics ID", description: "e.g. G-XXXXXXXXXX" },
  { key: "fb_pixel_id", value: "", type: "text", group: "integrations", label: "Facebook Pixel ID",  description: "Facebook Ads pixel tracking ID" },
];

export const seedSettings = async () => {
  try {
    const ops = DEFAULT_SETTINGS.map((s) => ({
      updateOne: {
        filter: { key: s.key },
        update: { $setOnInsert: s }, // Only inserts if key doesn't exist
        upsert: true,
      },
    }));

    const result = await SiteSettingModel.bulkWrite(ops);
    const inserted = result.upsertedCount || 0;
    if (inserted > 0) {
      console.log(`[SEED] Site settings: ${inserted} default(s) inserted`);
    }
  } catch (err) {
    console.error("[SEED] Site settings seeding failed:", err.message);
  }
};

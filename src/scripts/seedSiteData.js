/**
 * seedSiteData.js — dynamization spec §11
 *
 * Run with:   node src/scripts/seedSiteData.js
 *        or:  npm run seed   (after wiring the script in package.json)
 *
 * Idempotent: every operation uses findOneAndUpdate with upsert:true
 * and $set on a unique key, so re-running never produces duplicates.
 *
 * Order of execution (per spec §11.1):
 *   1. SiteConfig      — single document, fixed _id
 *   2. Services        — 11 core + 2 footer = 13 total
 *   3. TeamMember      — Amar Kumar + others
 *   4. Portfolio       — 3-5 sample projects
 *   5. Testimonials    — 4-6 approved + featured, showOn: ["home"]
 *   6. PricingPlan     — left empty (pricing still coming soon)
 *   7. CaseStudy       — left empty (case studies still coming soon)
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import config from "../config/config.js";
import { databaseConnection } from "../config/db.js";

import { SiteConfigModel, SITE_CONFIG_ID } from "../models/SiteConfig.model.js";
import { ServiceModel } from "../models/service.model.js";
import { TeamMemberModel } from "../models/TeamMember.model.js";
import { ProjectModel } from "../models/Project.model.js";
import { TestimonialModel } from "../models/Testimonial.model.js";
import { PricingPlanModel } from "../models/PricingPlan.model.js";
import { CaseStudyModel } from "../models/CaseStudy.model.js";

// ──────────────────────────────────────────────────────────────
// 1. SiteConfig — single document, fixed _id
// ──────────────────────────────────────────────────────────────
const SITE_CONFIG_DATA = {
  _id: SITE_CONFIG_ID,
  companyName: "Kraviona Tech Solutions",
  tagline: "MERN Stack Development & Technical SEO Solutions",
  description: "We build production-grade MERN stack apps with technical SEO baked in.",
  phone: "+91 9608553167",
  email: "kravionatech@gmail.com",
  address: "East Delhi, India 110092",

  social: {
    facebook: "https://facebook.com/kraviona",
    twitter: "https://twitter.com/kraviona",
    linkedin: "https://linkedin.com/company/kraviona",
    instagram: "",
    youtube: "",
  },

  hero: {
    badge1: "⚡SEO Optimized",
    badge2: "🚀MERN Stack Experts",
    badge3: "✅Fast Delivery",
    headline: "MERN Stack Development & Technical SEO Solutions",
    subheadline:
      "We engineer scalable web apps with MongoDB, Express, React & Node — and ship them with technical SEO baked in.",
    ctaPrimary: { text: "Get Started", link: "/contact" },
    ctaSecondary: { text: "Our Services", link: "/services" },
    phone: "+91 9608553167",
  },

  stats: {
    projectsDelivered: "150+",
    clientRetention: "99%",
    yearsExperience: "5+",
    support: "24/7",
    projectsLabel: "Projects Delivered",
    retentionLabel: "Client Retention Rate",
    experienceLabel: "Years of Experience",
    supportLabel: "Post-Launch Support",
  },

  whyUs: {
    title: "Why Kraviona",
    subtitle: "Three reasons our clients keep coming back.",
    features: [
      {
        icon: "⚡",
        title: "Agile Delivery",
        description: "Sprint-based development with weekly demos and a 14-day MVP turnaround.",
      },
      {
        icon: "📈",
        title: "Scalable Architecture",
        description: "MongoDB + Node.js + serverless deploys — built to grow with your traffic.",
      },
      {
        icon: "🔍",
        title: "Data-Driven SEO",
        description: "Every build ships with Core Web Vitals tuned and structured data in place.",
      },
    ],
  },

  whoWeAre: {
    title: "Who We Are",
    description:
      "A senior-only MERN stack team from East Delhi building production-grade web apps for startups, agencies, and enterprises worldwide.",
    ctaText: "Learn more about us",
    ctaLink: "/about",
  },

  techStack: [
    {
      category: "Frontend",
      categoryTitle: "Frontend",
      description: "Modern React with Next.js for SSR and SEO.",
      tools: [
        { name: "React", logoUrl: "" },
        { name: "Next.js", logoUrl: "" },
        { name: "TypeScript", logoUrl: "" },
        { name: "Tailwind CSS", logoUrl: "" },
      ],
    },
    {
      category: "Backend",
      categoryTitle: "Backend",
      description: "Event-driven Node APIs with Express.",
      tools: [
        { name: "Node.js", logoUrl: "" },
        { name: "Express.js", logoUrl: "" },
        { name: "GraphQL", logoUrl: "" },
        { name: "REST APIs", logoUrl: "" },
      ],
    },
    {
      category: "Database",
      categoryTitle: "Database",
      description: "NoSQL flexibility with relational reliability options.",
      tools: [
        { name: "MongoDB", logoUrl: "" },
        { name: "PostgreSQL", logoUrl: "" },
        { name: "Redis", logoUrl: "" },
        { name: "Mongoose", logoUrl: "" },
      ],
    },
    {
      category: "Cloud",
      categoryTitle: "Cloud & DevOps",
      description: "Zero-downtime deploys on modern platforms.",
      tools: [
        { name: "AWS", logoUrl: "" },
        { name: "Vercel", logoUrl: "" },
        { name: "Docker", logoUrl: "" },
        { name: "Railway", logoUrl: "" },
      ],
    },
  ],

  homeFaqs: [
    {
      question: "How long does a typical MERN project take?",
      answer:
        "MVPs ship in 4–6 weeks; full production apps take 8–12 weeks depending on scope.",
      order: 1,
    },
    {
      question: "Do you provide post-launch support?",
      answer:
        "Yes — every project includes 30 days of free post-launch support and an optional maintenance plan.",
      order: 2,
    },
    {
      question: "Can you take over an existing codebase?",
      answer:
        "Absolutely. We routinely inherit and modernise legacy MERN / MEAN / LAMP apps.",
      order: 3,
    },
    {
      question: "Do you work with international clients?",
      answer: "Yes — we work async-first with teams across the US, EU, UK, and APAC.",
      order: 4,
    },
    {
      question: "What's your pricing model?",
      answer: "Fixed-price for well-defined scopes; monthly retainer for ongoing work.",
      order: 5,
    },
    {
      question: "Will my app be SEO-friendly?",
      answer:
        "All builds ship with Core Web Vitals tuned, structured data, and server-rendered routes by default.",
      order: 6,
    },
    {
      question: "Do you sign NDAs?",
      answer: "Yes — we're happy to sign an NDA before discussing your project in detail.",
      order: 7,
    },
    {
      question: "What's your tech stack preference?",
      answer:
        "We default to the MERN stack because of its flexibility, but adapt to your team's stack.",
      order: 8,
    },
  ],

  newsletter: {
    title: "Subscribe to our newsletter",
    subtitle: "Get monthly insights on MERN stack, SEO, and shipping fast.",
    placeholder: "Enter your email",
  },

  footer: {
    description:
      "Kraviona Tech Solutions — a senior MERN stack agency building production-grade web apps with technical SEO.",
    capabilitiesLinks: [
      { label: "MERN Stack", href: "/services/mern-stack-development" },
      { label: "Full-Stack", href: "/services/full-stack-development" },
      { label: "React.js", href: "/services/react-development" },
      { label: "Node.js", href: "/services/nodejs-development" },
      { label: "Backend", href: "/services/backend-development" },
      { label: "API Development", href: "/services/api-development" },
      { label: "Database", href: "/services/database-architecture" },
      { label: "SaaS", href: "/services/saas-development" },
      { label: "Web App", href: "/services/web-app-development" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
      { label: "Technical SEO", href: "/services/technical-seo" },
      { label: "Performance", href: "/services/web-performance-optimization" },
      { label: "AI Automation", href: "/services/ai-automation" },
    ],
    companyLinks: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Gallery", href: "/gallery" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
    copyrightText: `© ${new Date().getFullYear()} Kraviona Tech Solutions. All rights reserved.`,
  },

  about: {
    heroTitle: "We engineer digital ecosystems that scale.",
    heroSubtitle:
      "A senior-only MERN stack team shipping production-grade web apps with technical SEO.",
    storyTitle: "Our Story",
    storyContent:
      "<p>Kraviona was founded with one mission — to bridge the gap between rapid MVP delivery and production-grade engineering. We started as a small team of MERN stack engineers in East Delhi and have since delivered 150+ projects for clients in the US, EU, UK, and APAC.</p><p>Today we are a focused group of senior developers, designers, and SEO specialists who refuse to ship anything that doesn't pass our internal quality bar.</p>",
    storyQuote: "We don't just write code; we solve complex business problems.",
    values: [
      {
        title: "Uncompromising Quality",
        description:
          "We refuse to ship bad code. Every line goes through peer review, linting, and automated tests.",
        icon: "🎯",
      },
      {
        title: "Absolute Transparency",
        description:
          "No hidden fees, no tech jargon. You get weekly demos and a clear roadmap from day one.",
        icon: "💎",
      },
      {
        title: "Continuous Innovation",
        description:
          "The tech world moves fast — we invest 10% of every week into R&D so you don't fall behind.",
        icon: "🚀",
      },
    ],
    ctaTitle: "Let's build something great together",
    ctaSubtitle: "Tell us about your project — we reply within 24 hours.",
  },

  pricing: {
    title: "Pricing",
    subtitle: "Flexible plans for every stage of your business.",
    disclaimer: "All prices in INR and exclusive of GST.",
    billingToggle: true,
    isComingSoon: true, // spec says leave it true until launch
  },

  googleAnalyticsId: "GTM-5LX2JWGD",
  googleVerification: "",
  defaultMetaTitle: "Kraviona Tech Solutions — MERN Stack & Technical SEO",
  defaultMetaDescription:
    "We build production-grade MERN stack web apps with technical SEO baked in.",
  defaultOgImage: "/og-image.jpg",
};

// ──────────────────────────────────────────────────────────────
// 2. Services — 11 core + 2 footer = 13 total
// ──────────────────────────────────────────────────────────────
const SERVICES_DATA = [
  {
    slug: "mern-stack-development",
    name: "MERN Stack Development",
    title: "MERN Stack Development",
    icon: "⚡",
    category: "web-development",
    badge: "Top Rated",
    isPopular: true,
    isFeatured: true,
    isPublished: true,
    order: 1,
    shortDesc: "Full-stack JavaScript apps built on MongoDB, Express, React, and Node.",
    longDesc:
      "End-to-end MERN stack development — from database architecture to React UI to Node APIs — delivered by senior engineers with 8+ years of experience.",
    whyChoose: {
      title: "Why Choose MERN Stack?",
      bullets: [
        "Single JavaScript language across the entire stack",
        "Faster time-to-market with Agile sprint delivery",
        "Horizontally scalable MongoDB architecture",
        "Rich open-source ecosystem and community support",
        "Cost-effective for startups, mid-market, and enterprises",
      ],
    },
    featureCards: [
      { number: "01", title: "MongoDB Database Design", description: "Flexible NoSQL schema for modern apps" },
      { number: "02", title: "Express.js REST API", description: "Secure, versioned RESTful APIs with middleware" },
      { number: "03", title: "React.js Frontend", description: "Dynamic React.js UIs with SSR via Next.js" },
      { number: "04", title: "Node.js Backend", description: "Event-driven, non-blocking server architecture" },
      { number: "05", title: "JWT Authentication", description: "Secure, stateless authentication & authorization" },
      { number: "06", title: "Cloud Deployment", description: "Production-ready deployment on AWS / Vercel / Railway" },
    ],
    faqs: [
      { question: "How long does a MERN Stack project take?", answer: "MVPs ship in 4-6 weeks; full apps in 8-12 weeks.", order: 1 },
      { question: "Do you provide ongoing support?", answer: "Yes — 30 days free post-launch plus optional retainers.", order: 2 },
      { question: "Can you migrate our existing app to MERN Stack?", answer: "Yes, we routinely migrate legacy LAMP / .NET / PHP apps.", order: 3 },
    ],
    technologies: [
      { name: "MongoDB" }, { name: "Express.js" }, { name: "React.js" }, { name: "Node.js" },
    ],
  },
  {
    slug: "full-stack-development",
    name: "Full-Stack Development",
    title: "Full-Stack Development",
    icon: "💻",
    category: "web-development",
    isPublished: true,
    order: 2,
    shortDesc: "JavaScript, Python, and TypeScript full-stack delivery.",
    longDesc: "Polyglot full-stack development — choose your stack, we deliver.",
    whyChoose: { title: "Why Choose Our Full-Stack Service?", bullets: ["Pick your stack", "Senior-only team", "Weekly demos"] },
    featureCards: [
      { number: "01", title: "Stack Selection", description: "We help you pick the right stack" },
      { number: "02", title: "Frontend", description: "React / Next / Vue / Svelte" },
      { number: "03", title: "Backend", description: "Node / Python / Go" },
    ],
    faqs: [{ question: "Which stack do you recommend?", answer: "MERN for most apps, Django for data-heavy products.", order: 1 }],
    technologies: [{ name: "React" }, { name: "Node.js" }, { name: "TypeScript" }],
  },
  {
    slug: "react-development",
    name: "React.js Development",
    title: "React.js Development",
    icon: "⚛️",
    category: "web-development",
    isPublished: true,
    order: 3,
    shortDesc: "Modern React UIs with hooks, context, and SSR via Next.js.",
    longDesc: "Production-grade React.js development with hooks, state management, and SSR.",
    whyChoose: { title: "Why React?", bullets: ["Massive ecosystem", "SSR with Next.js", "Strong TypeScript support"] },
    featureCards: [
      { number: "01", title: "Component Architecture", description: "Reusable, accessible components" },
      { number: "02", title: "State Management", description: "Redux, Zustand, or React Context" },
      { number: "03", title: "SSR with Next.js", description: "Server-side rendering for SEO" },
    ],
    faqs: [{ question: "Do you use TypeScript?", answer: "Yes — every new React project ships with TypeScript by default.", order: 1 }],
    technologies: [{ name: "React.js" }, { name: "Next.js" }, { name: "TypeScript" }],
  },
  {
    slug: "nodejs-development",
    name: "Node.js Development",
    title: "Node.js Development",
    icon: "🟢",
    category: "web-development",
    isPublished: true,
    order: 4,
    shortDesc: "High-performance Node.js APIs and microservices.",
    longDesc: "Scalable Node.js APIs and microservices for production workloads.",
    whyChoose: { title: "Why Node.js?", bullets: ["Non-blocking I/O", "Single language across stack", "Massive npm ecosystem"] },
    featureCards: [
      { number: "01", title: "Express / Fastify", description: "Modern HTTP frameworks" },
      { number: "02", title: "Microservices", description: "Loosely-coupled services" },
      { number: "03", title: "WebSockets", description: "Real-time bidirectional comms" },
    ],
    faqs: [{ question: "What's the difference between Node and Express?", answer: "Node is the runtime; Express is a minimal HTTP framework on top.", order: 1 }],
    technologies: [{ name: "Node.js" }, { name: "Express" }, { name: "Fastify" }],
  },
  {
    slug: "backend-development",
    name: "Backend Development",
    title: "Backend Development",
    icon: "⚙️",
    category: "backend-architecture",
    isPublished: true,
    order: 5,
    shortDesc: "Robust, secure, and scalable backend systems.",
    longDesc: "Production-grade backend systems — auth, queues, payments, real-time.",
    whyChoose: { title: "Why Our Backend Service?", bullets: ["Battle-tested patterns", "Security-first", "Observability built in"] },
    featureCards: [
      { number: "01", title: "Authentication", description: "JWT, OAuth, session-based" },
      { number: "02", title: "Background Jobs", description: "BullMQ, Celery, Sidekiq" },
      { number: "03", title: "Payments", description: "Stripe, Razorpay, Paddle" },
    ],
    faqs: [{ question: "Do you handle compliance?", answer: "Yes — GDPR, SOC 2, PCI-DSS patterns are part of our default.", order: 1 }],
    technologies: [{ name: "Node.js" }, { name: "PostgreSQL" }, { name: "Redis" }],
  },
  {
    slug: "api-development",
    name: "API Development",
    title: "API Development",
    icon: "🔌",
    category: "backend-architecture",
    isPublished: true,
    order: 6,
    shortDesc: "REST and GraphQL API design and implementation.",
    longDesc: "API design, documentation, and implementation — REST, GraphQL, gRPC.",
    whyChoose: { title: "Why Invest in Good APIs?", bullets: ["Faster integrations", "Better DX", "Future-proof architecture"] },
    featureCards: [
      { number: "01", title: "REST APIs", description: "OpenAPI 3.1 spec, JWT auth" },
      { number: "02", title: "GraphQL", description: "Apollo Server, type-safe schemas" },
      { number: "03", title: "gRPC", description: "For low-latency internal services" },
    ],
    faqs: [{ question: "REST or GraphQL?", answer: "REST for public APIs; GraphQL for complex internal UIs.", order: 1 }],
    technologies: [{ name: "GraphQL" }, { name: "REST" }, { name: "gRPC" }],
  },
  {
    slug: "database-architecture",
    name: "Database Architecture",
    title: "Database Architecture",
    icon: "🗄️",
    category: "backend-architecture",
    isPublished: true,
    order: 7,
    shortDesc: "Schema design, indexing, replication, and sharding.",
    longDesc: "Database design and optimisation for NoSQL and SQL workloads.",
    whyChoose: { title: "Why Database Architecture Matters", bullets: ["Faster queries", "Lower costs", "Higher reliability"] },
    featureCards: [
      { number: "01", title: "Schema Design", description: "Normalised or denormalised" },
      { number: "02", title: "Performance Tuning", description: "Indexing, query plans" },
      { number: "03", title: "Replication", description: "Multi-region failover" },
    ],
    faqs: [{ question: "MongoDB or PostgreSQL?", answer: "Both — depends on access patterns. We help you choose.", order: 1 }],
    technologies: [{ name: "MongoDB" }, { name: "PostgreSQL" }, { name: "Redis" }],
  },
  {
    slug: "saas-development",
    name: "SaaS Development",
    title: "SaaS Development",
    icon: "☁️",
    category: "backend-architecture",
    isPublished: true,
    order: 8,
    shortDesc: "Multi-tenant SaaS platforms with billing and auth.",
    longDesc: "Multi-tenant SaaS platforms — billing, auth, RBAC, and observability included.",
    whyChoose: { title: "Why Build SaaS With Us?", bullets: ["Multi-tenant patterns", "Stripe billing", "Production-grade auth"] },
    featureCards: [
      { number: "01", title: "Multi-tenancy", description: "Shared or isolated DB strategies" },
      { number: "02", title: "Billing", description: "Stripe / Razorpay integration" },
      { number: "03", title: "RBAC", description: "Role-based access control" },
    ],
    faqs: [{ question: "How do you handle multi-tenancy?", answer: "Either shared schema with tenantId columns, or schema-per-tenant.", order: 1 }],
    technologies: [{ name: "Stripe" }, { name: "Auth0" }, { name: "PostHog" }],
  },
  {
    slug: "technical-seo",
    name: "Technical SEO",
    title: "Technical SEO",
    icon: "📈",
    category: "performance-ai",
    badge: "Most Popular",
    isPopular: true,
    isFeatured: true,
    isPublished: true,
    order: 9,
    shortDesc: "Core Web Vitals, structured data, and crawl optimisation.",
    longDesc: "Technical SEO that actually moves rankings — Core Web Vitals, structured data, crawl budget, and internal linking.",
    whyChoose: { title: "Why Technical SEO?", bullets: ["Faster pages rank higher", "Better crawl coverage", "Higher conversion rates"] },
    featureCards: [
      { number: "01", title: "Core Web Vitals", description: "LCP, CLS, INP optimisation" },
      { number: "02", title: "Structured Data", description: "JSON-LD, schema.org" },
      { number: "03", title: "Crawl Budget", description: "Log file analysis" },
    ],
    faqs: [{ question: "How long until I see results?", answer: "Typically 3-6 months for sustained ranking improvements.", order: 1 }],
    technologies: [{ name: "Lighthouse" }, { name: "Schema.org" }, { name: "Screaming Frog" }],
  },
  {
    slug: "web-performance-optimization",
    name: "Web Performance Optimization",
    title: "Web Performance Optimization",
    icon: "🚀",
    category: "performance-ai",
    isPublished: true,
    order: 10,
    shortDesc: "Sub-second load times on every device.",
    longDesc: "Page load audits and performance engineering — sub-second TTFB, optimised bundles, edge caching.",
    whyChoose: { title: "Why Performance Matters", bullets: ["Higher conversion", "Better SEO", "Lower bounce rate"] },
    featureCards: [
      { number: "01", title: "Bundle Optimisation", description: "Code splitting, tree-shaking" },
      { number: "02", title: "Image Optimisation", description: "AVIF / WebP, responsive sizes" },
      { number: "03", title: "Edge Caching", description: "CDN + ISR" },
    ],
    faqs: [{ question: "What's a good Lighthouse score?", answer: "90+ on all four metrics is our standard.", order: 1 }],
    technologies: [{ name: "Vite" }, { name: "Cloudflare" }, { name: "Lighthouse" }],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    title: "AI Automation",
    icon: "🤖",
    category: "performance-ai",
    badge: "New",
    isFeatured: true,
    isPublished: true,
    order: 11,
    shortDesc: "LLM integrations, RAG pipelines, and agentic workflows.",
    longDesc: "AI automation services — LLM integrations, RAG pipelines, and agentic workflows for your business.",
    whyChoose: { title: "Why AI Automation?", bullets: ["10x team productivity", "24/7 customer support", "Smarter decisions"] },
    featureCards: [
      { number: "01", title: "LLM Integrations", description: "OpenAI, Claude, Gemini" },
      { number: "02", title: "RAG Pipelines", description: "Vector DB + embeddings" },
      { number: "03", title: "Agentic Workflows", description: "Multi-step automation" },
    ],
    faqs: [{ question: "Which LLM do you use?", answer: "Depends on the use case — Claude for reasoning, OpenAI for speed.", order: 1 }],
    technologies: [{ name: "OpenAI" }, { name: "Claude" }, { name: "LangChain" }],
  },
  // Footer-referenced extras
  {
    slug: "web-app-development",
    name: "Web App Development",
    title: "Web App Development",
    icon: "🌐",
    category: "web-development",
    isPublished: true,
    order: 12,
    shortDesc: "Custom web applications tailored to your business.",
    longDesc: "End-to-end custom web application development.",
    whyChoose: { title: "Why Custom Web Apps?", bullets: ["Tailor-made UX", "Full ownership", "Scalable architecture"] },
    featureCards: [
      { number: "01", title: "Discovery", description: "Workshops, wireframes, user flows" },
      { number: "02", title: "Build", description: "Sprint-based development" },
      { number: "03", title: "Launch", description: "Production deploy + monitoring" },
    ],
    faqs: [{ question: "How long does a web app take?", answer: "MVPs in 4-6 weeks; full apps in 8-12 weeks.", order: 1 }],
    technologies: [{ name: "React" }, { name: "Node.js" }, { name: "MongoDB" }],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    title: "UI/UX Design",
    icon: "🎨",
    category: "web-development",
    isPublished: true,
    order: 13,
    shortDesc: "Conversion-focused UI/UX design with Figma.",
    longDesc: "Conversion-focused UI/UX design — wireframes, prototypes, and design systems.",
    whyChoose: { title: "Why Invest in UI/UX?", bullets: ["Higher conversion", "Lower churn", "Stronger brand"] },
    featureCards: [
      { number: "01", title: "Wireframes", description: "Lo-fi structure" },
      { number: "02", title: "Prototypes", description: "Clickable Figma flows" },
      { number: "03", title: "Design System", description: "Reusable component library" },
    ],
    faqs: [{ question: "Do you provide dev handoff?", answer: "Yes — Figma + Storybook + token JSON for engineers.", order: 1 }],
    technologies: [{ name: "Figma" }, { name: "Storybook" }, { name: "Tailwind" }],
  },
];

// ──────────────────────────────────────────────────────────────
// 3. TeamMember — Amar Kumar
// ──────────────────────────────────────────────────────────────
const TEAM_DATA = [
  {
    slug: "amar-kumar",
    name: "Amar Kumar",
    designation: "Founder & Lead MERN Stack Engineer",
    role: "Founder & Lead MERN Stack Engineer",
    bio:
      "Senior full-stack engineer with 8+ years of experience building production-grade MERN applications. Founded Kraviona to bridge the gap between rapid MVP delivery and production-grade engineering.",
    avatar: { url: "https://kraviona.com/team/amar.jpg", alt: "Amar Kumar" },
    social: {
      linkedin: "https://linkedin.com/in/kraviona",
      twitter: "https://twitter.com/kraviona",
      github: "https://github.com/kraviona",
    },
    skills: ["React.js", "Next.js", "Node.js", "MongoDB", "TypeScript", "AWS"],
    order: 1,
    isPublished: true,
  },
];

// ──────────────────────────────────────────────────────────────
// 4. Portfolio — 4 sample projects
// ──────────────────────────────────────────────────────────────
const PORTFOLIO_DATA = [
  {
    title: "MERN SaaS Analytics Dashboard",
    slug: "mern-saas-analytics-dashboard",
    client: "Internal R&D",
    clientName: "Internal R&D",
    industry: "SaaS",
    projectType: "dashboard",
    description: "Real-time analytics dashboard for SaaS founders with Stripe billing integration.",
    problem: "Founders had no real-time view of MRR, churn, and customer health metrics.",
    challenge: "Building a real-time analytics dashboard that scales to 100k+ events per day.",
    solution: "Event-sourced architecture with MongoDB change streams and React + Recharts frontend.",
    results: [
      { metric: "Page Load", value: "0.9s", description: "P95 load time" },
      { metric: "Real-time Events", value: "100k/day", description: "Sustained throughput" },
    ],
    technologies: ["MongoDB", "Express", "React", "Node.js", "Redis", "Recharts"],
    techStack: ["MongoDB", "Express", "React", "Node.js", "Redis", "Recharts"],
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2025-04-15"),
    duration: "8 weeks",
    status: "active",
    order: 1,
  },
  {
    title: "E-commerce SEO Overhaul",
    slug: "ecommerce-seo-overhaul",
    client: "Acme Retail",
    clientName: "Acme Retail",
    industry: "E-commerce",
    projectType: "ecommerce",
    description: "Migrated a legacy PHP e-commerce site to Next.js with full SEO overhaul.",
    problem: "Legacy site had 2.5s LCP and was losing rankings to faster competitors.",
    challenge: "Migrating 10,000 SKUs and 50,000 indexed URLs without losing SEO equity.",
    solution: "Next.js ISR + structured data + 301 redirect mapping for every legacy URL.",
    results: [
      { metric: "LCP", value: "0.8s", description: "Down from 2.5s" },
      { metric: "Organic Traffic", value: "+212%", description: "Within 4 months" },
    ],
    technologies: ["Next.js", "Node.js", "MongoDB", "TypeScript"],
    techStack: ["Next.js", "Node.js", "MongoDB", "TypeScript"],
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2025-02-10"),
    duration: "10 weeks",
    status: "active",
    order: 2,
  },
  {
    title: "Healthcare Patient Portal",
    slug: "healthcare-patient-portal",
    client: "MediCare Plus",
    clientName: "MediCare Plus",
    industry: "Healthcare",
    projectType: "web-app",
    description: "HIPAA-compliant patient portal with appointment booking and telehealth.",
    problem: "Patients had to call for appointments; clinic staff were overwhelmed.",
    challenge: "Building a HIPAA-compliant portal with telehealth integration.",
    solution: "MERN stack with end-to-end encryption, Twilio Video for telehealth, and Stripe for payments.",
    results: [
      { metric: "Appointments Booked Online", value: "78%", description: "Up from 0%" },
      { metric: "Patient Satisfaction", value: "4.8/5", description: "Post-launch survey" },
    ],
    technologies: ["React", "Node.js", "MongoDB", "Twilio", "Stripe"],
    techStack: ["React", "Node.js", "MongoDB", "Twilio", "Stripe"],
    isFeatured: false,
    isPublished: true,
    completedAt: new Date("2024-11-22"),
    duration: "12 weeks",
    status: "active",
    order: 3,
  },
  {
    title: "AI Customer Support Agent",
    slug: "ai-customer-support-agent",
    client: "ShopEase",
    clientName: "ShopEase",
    industry: "E-commerce",
    projectType: "saas",
    description: "RAG-based AI support agent that handles 60% of tickets autonomously.",
    problem: "Support team was overwhelmed with 2,000+ tickets per day.",
    challenge: "Building an AI agent that knows the product catalog and order status.",
    solution: "RAG pipeline over product docs + real-time order lookup via Shopify API.",
    results: [
      { metric: "Auto-Resolved Tickets", value: "62%", description: "Without human intervention" },
      { metric: "CSAT", value: "4.6/5", description: "For AI-handled tickets" },
    ],
    technologies: ["OpenAI", "LangChain", "Pinecone", "Node.js", "React"],
    techStack: ["OpenAI", "LangChain", "Pinecone", "Node.js", "React"],
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2025-05-30"),
    duration: "6 weeks",
    status: "active",
    order: 4,
  },
];

// ──────────────────────────────────────────────────────────────
// 5. Testimonials — 5 approved + featured, showOn: ["home"]
// ──────────────────────────────────────────────────────────────
const TESTIMONIALS_DATA = [
  {
    clientName: "Rohit Sharma",
    designation: "CTO",
    company: "FinStack",
    rating: 5,
    review:
      "Kraviona delivered our fintech platform in 9 weeks — production-grade MERN stack with bank-level security. Their attention to detail is unmatched.",
    showOn: ["home", "about"],
    isApproved: true,
    isFeatured: true,
    isPublished: true,
    order: 1,
    platform: "direct",
  },
  {
    clientName: "Priya Mehta",
    designation: "Founder",
    company: "HealthKart",
    rating: 5,
    review:
      "The SEO overhaul Kraviona did for us increased our organic traffic by 212% in 4 months. They're the real deal.",
    showOn: ["home", "gallery", "service"],
    isApproved: true,
    isFeatured: true,
    isPublished: true,
    order: 2,
    platform: "google",
  },
  {
    clientName: "James Wilson",
    designation: "Head of Engineering",
    company: "CloudNine Labs",
    rating: 5,
    review:
      "Senior-only team that genuinely understands production workloads. We've been working with them for over a year now.",
    showOn: ["home", "about"],
    isApproved: true,
    isFeatured: true,
    isPublished: true,
    order: 3,
    platform: "clutch",
  },
  {
    clientName: "Anita Desai",
    designation: "Product Manager",
    company: "MediCare Plus",
    rating: 5,
    review:
      "Our patient portal launched on time and HIPAA-compliant from day one. The Kraviona team handled everything.",
    showOn: ["home", "service", "case-study"],
    isApproved: true,
    isFeatured: true,
    isPublished: true,
    order: 4,
    platform: "linkedin",
  },
  {
    clientName: "Daniel Park",
    designation: "CEO",
    company: "ShopEase",
    rating: 5,
    review:
      "Their AI agent now handles 62% of our support tickets. The ROI was visible within the first month.",
    showOn: ["home", "service"],
    isApproved: true,
    isFeatured: true,
    isPublished: true,
    order: 5,
    platform: "google",
  },
];

// ──────────────────────────────────────────────────────────────
// Idempotent seed runner
// ──────────────────────────────────────────────────────────────
const upsertOne = async (Model, key, payload) => {
  const doc = await Model.findOneAndUpdate(
    key,
    { $set: payload },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return doc;
};

const seedSiteConfig = async () => {
  const doc = await upsertOne(
    SiteConfigModel,
    { _id: SITE_CONFIG_ID },
    SITE_CONFIG_DATA,
  );
  return doc._id;
};

const seedServices = async () => {
  let count = 0;
  for (const s of SERVICES_DATA) {
    await upsertOne(ServiceModel, { slug: s.slug }, s);
    count++;
  }
  return count;
};

const seedTeam = async () => {
  let count = 0;
  for (const t of TEAM_DATA) {
    await upsertOne(TeamMemberModel, { slug: t.slug }, t);
    count++;
  }
  return count;
};

const seedPortfolio = async () => {
  let count = 0;
  for (const p of PORTFOLIO_DATA) {
    await upsertOne(ProjectModel, { slug: p.slug }, p);
    count++;
  }
  return count;
};

const seedTestimonials = async () => {
  let count = 0;
  for (const t of TESTIMONIALS_DATA) {
    // Unique key = clientName + company (testimonials don't always have slug)
    await upsertOne(
      TestimonialModel,
      { clientName: t.clientName, company: t.company },
      t,
    );
    count++;
  }
  return count;
};

// PricingPlan and CaseStudy are intentionally left empty per spec §6/§5.
// Toggle SiteConfig.pricing.isComingSoon to false when ready to launch.

const main = async () => {
  console.log("\n🌱  Starting Kraviona site-data seed (idempotent)...\n");

  await databaseConnection();

  try {
    const configId = await seedSiteConfig();
    console.log(`  ✅ SiteConfig           : ${configId}`);

    const svcCount = await seedServices();
    console.log(`  ✅ Services             : ${svcCount} upserted`);

    const teamCount = await seedTeam();
    console.log(`  ✅ Team Members         : ${teamCount} upserted`);

    const portCount = await seedPortfolio();
    console.log(`  ✅ Portfolio Projects   : ${portCount} upserted`);

    const testCount = await seedTestimonials();
    console.log(`  ✅ Testimonials         : ${testCount} upserted`);

    const pricingCount = await PricingPlanModel.countDocuments();
    const caseCount = await CaseStudyModel.countDocuments();
    console.log(`  ⏭  Pricing Plans        : ${pricingCount} (empty — set SiteConfig.pricing.isComingSoon=false to launch)`);
    console.log(`  ⏭  Case Studies         : ${caseCount} (empty — populate from admin panel)`);

    console.log("\n🎉  Seed complete. Re-run safely — no duplicates.\n");
  } catch (err) {
    console.error("❌  Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
};

// Run if invoked directly
if (process.argv[1] && process.argv[1].endsWith("seedSiteData.js")) {
  main();
}

export { main as runSeed };

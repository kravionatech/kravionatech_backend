# KRAVIONA BACKEND — REST API GUIDE

> **Audience:** Frontend developers (Next.js 14 App Router) **and** AI agents performing CRM / client-side code review.
> **Source of truth:** `kraviona_dynamization_spec.docx` (v1.0) + every controller/route under `src/`.
> **Version:** 2.0  •  Last updated: 2026-06-02

---

## TABLE OF CONTENTS

1.  [Quick Reference](#1-quick-reference)
2.  [Authentication & Authorization](#2-authentication--authorization)
3.  [Standard Response Envelope](#3-standard-response-envelope)
4.  [Error Codes & Format](#4-error-codes--format)
5.  [Rate Limiting](#5-rate-limiting)
6.  [Caching & ISR Strategy](#6-caching--isr-strategy)
7.  [API Surface — `/api/v1/*` (Dynamization Spec)](#7-api-surface--apiv1-dynamization-spec)
    -   7.1  [SiteConfig](#71-siteconfig)
    -   7.2  [Services](#72-services)
    -   7.3  [Portfolio / Projects](#73-portfolio--projects)
    -   7.4  [Team](#74-team)
    -   7.5  [Testimonials](#75-testimonials)
    -   7.6  [Case Studies](#76-case-studies)
    -   7.7  [Pricing](#77-pricing)
    -   7.8  [Contact Form](#78-contact-form)
    -   7.9  [Newsletter](#79-newsletter)
8.  [API Surface — `/api/*` (Existing / Preserved)](#8-api-surface--api-existing--preserved)
9.  [Media Upload (Cloudinary)](#9-media-upload-cloudinary)
10. [Data Models Reference (Mongoose Schemas)](#10-data-models-reference-mongoose-schemas)
11. [Frontend Fetch Helpers](#11-frontend-fetch-helpers)
12. [AI Agent — Review Checklist & CRM Integration Guide](#12-ai-agent--review-checklist--crm-integration-guide)
13. [Per-Page Data Requirements (kraviona.com)](#13-per-page-data-requirements-kravionacom)

---

## 1. Quick Reference

| Item                | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Base URL (prod)     | `https://api.kraviona.com/api`                                 |
| Base URL (dev)      | `http://localhost:5000/api`                                    |
| API versioning      | All new dynamization routes live under `/api/v1/*`             |
| Auth header         | `Authorization: Bearer <jwt>`                                  |
| Content-Type        | `application/json` (except uploads → `multipart/form-data`)    |
| Auth roles          | `super_admin` > `admin` > `editor` > `viewer` > `user`         |
| Default public rate | 100 requests / 15 min / IP                                     |
| Auth rate limit     | 20 requests / 1 min / IP                                       |
| CORS                | Wildcard (`*`) in dev; restrict in prod                        |
| Default cache TTLs  | site-config 10m · services 5m · services/nav 30m · team 5m · portfolio 5m · testimonials 5m · pricing 10m |

---

## 2. Authentication & Authorization

### 2.1 Obtaining a JWT

| Method  | Endpoint                              | Body                                            | Auth |
| ------- | ------------------------------------- | ----------------------------------------------- | ---- |
| Sign up | `POST /api/auth/create-account`       | `{name, email, username, phone, password}`      | No   |
| Verify  | `POST /api/auth/verify-account`       | `{identifier, otp}`                             | No   |
| Re-OTP  | `POST /api/auth/resend-otp`           | `{identifier}`                                  | No   |
| Login   | `POST /api/auth/login-password`       | `{identifier, password}`                        | No   |
| OTP     | `POST /api/auth/login-otp`            | `{identifier, otp}`                             | No   |
| Refresh | `POST /api/auth/refresh-token`        | `{token}` (refresh token)                       | No   |
| Logout  | `POST /api/auth/logout`               | `{token}`                                       | Yes  |

> `identifier` = email **or** phone **or** username.
> Password login returns `{ accessToken, refreshToken }`. Use `accessToken` for protected routes.

### 2.2 Sending the token

```http
Authorization: Bearer <accessToken>
```

### 2.3 Role hierarchy

`super_admin` > `admin` > `editor` > `viewer` > `user`

> ⚠️ Every protected route in this guide currently requires **`super_admin`**. Loosen by passing multiple roles to `roleCheck(...)` in the route file.

### 2.4 User admin (super_admin only)

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/admin/users`             | List all users           |
| PATCH  | `/api/admin/user/role`         | Update user role         |
| PATCH  | `/api/admin/user/:id/block`    | Block / unblock          |
| DELETE | `/api/admin/user/:id`          | Hard delete (guarded)    |

---

## 3. Standard Response Envelope

Every endpoint returns this exact shape — no exceptions.

```jsonc
// ✅ 2xx success
{
  "success": true,
  "data": { /* endpoint-specific payload, or [] */ },
  "message": "Human-readable status message"
}

// ❌ 4xx / 5xx error
{
  "success": false,
  "data": null,
  "message": "Human-readable error",
  "errors": { "fieldName": ["Array of error messages"] } // optional, on validation
}
```

**Cache marker:** Public GETs set the response header `x-cache: HIT` or `x-cache: MISS`.

---

## 4. Error Codes & Format

| HTTP | Meaning                  | When                                                           |
| ---- | ------------------------ | -------------------------------------------------------------- |
| 200  | OK                       | Successful GET / PUT                                           |
| 201  | Created                  | Successful POST                                                |
| 400  | Bad Request              | Validation error (see `errors` object)                         |
| 401  | Unauthorized             | Missing or invalid JWT                                         |
| 403  | Forbidden                | Logged in but role insufficient                                |
| 404  | Not Found                | Resource missing or route unknown                              |
| 409  | Conflict                 | Duplicate unique key (slug, email, etc.)                       |
| 429  | Too Many Requests        | Rate limit hit                                                 |
| 500  | Internal Server Error    | Bug or unhandled exception                                      |

---

## 5. Rate Limiting

| Scope                       | Limit                |
| --------------------------- | -------------------- |
| `/api/auth/*`               | 20 req / 1 min / IP  |
| `/api/track/*` (analytics)  | 60 req / 1 min / IP  |
| All other `/api/*`          | 100 req / 15 min / IP |

> Spec §12.3 mandates 100 req / 15 min for all public routes. The above matches.

---

## 6. Caching & ISR Strategy

### 6.1 Server-side cache (Redis with in-memory fallback)

Every public GET on the spec routes is wrapped by `cacheMiddleware(scope, ttl)`:

| Scope                | Key                          | TTL      |
| -------------------- | ---------------------------- | -------- |
| `siteConfig`         | `cache:site-config`          | 600s     |
| `services`           | `cache:services`             | 300s     |
| `servicesNav`        | `cache:services-nav`         | 1800s    |
| `team`               | `cache:team`                 | 300s     |
| `portfolio`          | `cache:portfolio`            | 300s     |
| `portfolioFeatured`  | `cache:portfolio-featured`   | 300s     |
| `testimonials`       | `cache:testimonials`         | 300s     |
| `testimonialsFeatured` | `cache:testimonials-featured` | 300s   |
| `pricing`            | `cache:pricing`              | 600s     |

> Redis is **optional**. If `REDIS_URL` is unset, the layer falls back to a TTL-aware in-memory `Map` so the API still responds quickly during dev.

### 6.2 Cache invalidation

Every protected `POST / PUT / DELETE` calls `invalidateCache(scope)` after the DB write succeeds — so the next public request re-hydrates from MongoDB. The scope is wired per-route (e.g. updating a service invalidates `services` and `servicesNav`).

### 6.3 Next.js ISR (frontend)

Use the helper in §11 with `{ next: { revalidate: 300 } }` to mirror the 5-minute SLA on the frontend.

---

## 7. API Surface — `/api/v1/*` (Dynamization Spec)

> **All routes are mounted under `/api`** in `app.js`. The `/v1/*` is part of the route path. Example: `GET /api/v1/public/services`.

### 7.1 SiteConfig

A **single MongoDB document** (`_id = "kraviona_site_config_v1"`) holding every global piece of content the homepage / about / footer / pricing page reads.

#### `GET /api/v1/public/site-config` — Public · Redis 10 min

Returns the full config (or a transient default in memory if never seeded). Every frontend page that needs anything from the homepage, footer, or about page starts here.

```jsonc
// 200 OK
{
  "success": true,
  "data": {
    "_id": "kraviona_site_config_v1",
    "companyName": "Kraviona Tech Solutions",
    "tagline": "MERN Stack Development & Technical SEO Solutions",
    "description": "We build production-grade MERN stack apps with technical SEO baked in.",
    "phone": "+91 9608553167",
    "email": "kravionatech@gmail.com",
    "address": "East Delhi, India 110092",

    "social": {
      "facebook":  "https://facebook.com/kraviona",
      "twitter":   "https://twitter.com/kraviona",
      "linkedin":  "https://linkedin.com/company/kraviona",
      "instagram": "",
      "youtube":   ""
    },

    "hero": {
      "badge1": "⚡SEO Optimized",
      "badge2": "🚀MERN Stack Experts",
      "badge3": "✅Fast Delivery",
      "headline": "MERN Stack Development & Technical SEO Solutions",
      "subheadline": "We engineer scalable web apps …",
      "ctaPrimary":   { "text": "Get Started", "link": "/contact" },
      "ctaSecondary": { "text": "Our Services", "link": "/services" },
      "phone": "+91 9608553167"
    },

    "stats": {
      "projectsDelivered": "150+",  "clientRetention": "99%",
      "yearsExperience":   "5+",    "support":         "24/7",
      "projectsLabel":   "Projects Delivered",
      "retentionLabel":  "Client Retention Rate",
      "experienceLabel": "Years of Experience",
      "supportLabel":    "Post-Launch Support"
    },

    "whyUs": {
      "title": "Why Kraviona",
      "subtitle": "Three reasons our clients keep coming back.",
      "features": [
        { "icon": "⚡", "title": "Agile Delivery",      "description": "…" },
        { "icon": "📈", "title": "Scalable Architecture","description": "…" },
        { "icon": "🔍", "title": "Data-Driven SEO",     "description": "…" }
      ]
    },

    "whoWeAre": {
      "title": "Who We Are",
      "description": "A senior-only MERN stack team …",
      "ctaText": "Learn more about us",
      "ctaLink": "/about"
    },

    "techStack": [
      {
        "category": "Frontend", "categoryTitle": "Frontend",
        "description": "Modern React with Next.js for SSR and SEO.",
        "tools": [
          { "name": "React",       "logoUrl": "" },
          { "name": "Next.js",     "logoUrl": "" },
          { "name": "TypeScript",  "logoUrl": "" },
          { "name": "Tailwind CSS","logoUrl": "" }
        ]
      }
      // … 4 categories total: Frontend, Backend, Database, Cloud
    ],

    "homeFaqs": [
      { "question": "…", "answer": "…", "order": 1 }
    ],

    "newsletter": {
      "title":       "Subscribe to our newsletter",
      "subtitle":    "Get monthly insights on MERN stack, SEO, and shipping fast.",
      "placeholder": "Enter your email"
    },

    "footer": {
      "description": "Kraviona Tech Solutions — …",
      "capabilitiesLinks": [{ "label": "MERN Stack", "href": "/services/mern-stack-development" }],
      "companyLinks":      [{ "label": "Home", "href": "/" }],
      "copyrightText": "© 2026 Kraviona Tech Solutions. All rights reserved."
    },

    "about": {
      "heroTitle":    "We engineer digital ecosystems that scale.",
      "heroSubtitle": "…",
      "storyTitle":   "Our Story",
      "storyContent": "<p>…</p>",
      "storyQuote":   "We don't just write code; we solve complex business problems.",
      "values": [
        { "title": "Uncompromising Quality",   "description": "…", "icon": "🎯" },
        { "title": "Absolute Transparency",   "description": "…", "icon": "💎" },
        { "title": "Continuous Innovation",   "description": "…", "icon": "🚀" }
      ],
      "ctaTitle":    "Let's build something great together",
      "ctaSubtitle": "Tell us about your project — we reply within 24 hours."
    },

    "pricing": {
      "title":         "Pricing",
      "subtitle":      "Flexible plans for every stage of your business.",
      "disclaimer":    "All prices in INR and exclusive of GST.",
      "billingToggle": true,
      "isComingSoon":  true
    },

    "googleAnalyticsId":     "GTM-5LX2JWGD",
    "googleVerification":    "",
    "defaultMetaTitle":      "Kraviona Tech Solutions — MERN Stack & Technical SEO",
    "defaultMetaDescription":"We build production-grade MERN stack web apps with technical SEO baked in.",
    "defaultOgImage":        "/og-image.jpg"
  },
  "message": ""
}
```

#### `PUT /api/v1/site-config` — Protected · super_admin

Full or partial update of the single SiteConfig document. Invalidates the `site-config` cache key.

```http
PUT /api/v1/site-config
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "hero": { "headline": "New headline" },
  "stats": { "projectsDelivered": "200+" },
  "pricing": { "isComingSoon": false }
}
```

```jsonc
// 200 OK
{ "success": true, "message": "Site config updated successfully", "data": { … } }
```

---

### 7.2 Services

#### Public

| Method | Path                                  | Cache | Description                                  |
| ------ | ------------------------------------- | ----- | -------------------------------------------- |
| GET    | `/api/v1/public/services`             | 5 m   | All active + published services              |
| GET    | `/api/v1/public/services/nav`         | 30 m  | `{title, slug, icon, category}` only — for nav |
| GET    | `/api/v1/public/services/:slug`       | —     | Single service by slug, with related services populated |

**Query params for `GET /api/v1/public/services`:**
- `category=web-development|backend-architecture|performance-ai|general`
- `featured=true`
- `limit=<n>`

**Response shape (single service):**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "name": "MERN Stack Development",
    "title": "MERN Stack Development",
    "slug": "mern-stack-development",
    "icon": "⚡",
    "category": "web-development",
    "badge": "Top Rated",
    "isPopular": true,
    "isFeatured": true,
    "isPublished": true,
    "order": 1,
    "shortDesc": "Full-stack JavaScript apps …",
    "longDesc": "End-to-end MERN stack development — …",
    "whyChoose": {
      "title": "Why Choose MERN Stack?",
      "bullets": [
        "Single JavaScript language across the entire stack",
        "Faster time-to-market with Agile sprint delivery"
      ]
    },
    "featureCards": [
      { "number": "01", "title": "MongoDB Database Design", "description": "Flexible NoSQL schema for modern apps" }
    ],
    "faqs": [
      { "question": "…", "answer": "…", "order": 1 }
    ],
    "technologies": [
      { "name": "MongoDB", "logoUrl": "", "subtitle": "" }
    ],
    "relatedServices": [
      { "_id": "…", "name": "Full-Stack Development", "slug": "full-stack-development", "icon": "💻" }
    ],
    "seo": {
      "metaTitle":       "MERN Stack Development — Kraviona",
      "metaDescription": "…",
      "keywords":        ["mern","mongodb","express","react","nodejs"],
      "canonicalUrl":    "…",
      "ogTitle":         "…",
      "ogDescription":   "…",
      "ogImage":         "…"
    }
  },
  "message": ""
}
```

#### Protected (super_admin)

| Method | Path                              | Body                                              | Description                |
| ------ | --------------------------------- | ------------------------------------------------- | -------------------------- |
| POST   | `/api/v1/services`                | Full service shape                                | Create                     |
| PUT    | `/api/v1/services/:id`            | Partial service shape                             | Update                     |
| DELETE | `/api/v1/services/:id`            | —                                                 | Soft delete (sets isActive/isPublished=false) |
| PUT    | `/api/v1/services/reorder`        | `{ "order": [{ "id": "…", "order": 1 }, …] }`     | Bulk reorder (drag-drop)   |

> All protected writes invalidate the `services` and `servicesNav` cache keys.

---

### 7.3 Portfolio / Projects

#### Public

| Method | Path                                       | Cache | Description |
| ------ | ------------------------------------------ | ----- | ----------- |
| GET    | `/api/v1/public/portfolio`                 | 5 m   | All active projects |
| GET    | `/api/v1/public/portfolio/featured`        | 5 m   | Only `isFeatured: true` |
| GET    | `/api/v1/public/portfolio/:slug`           | —     | Single project, with servicesUsed populated |

**Query params:** `projectType`, `industry`, `featured=true`, `limit=<n>`

**Response shape (single project):**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "title": "MERN SaaS Analytics Dashboard",
    "slug":  "mern-saas-analytics-dashboard",
    "client": "Internal R&D",
    "clientName": "Internal R&D",
    "clientLogo": { "url": "…" },
    "industry":  "SaaS",
    "projectType": "dashboard",
    "description": "Real-time analytics dashboard for SaaS founders …",
    "challenge": "Building a real-time analytics dashboard that scales …",
    "challengeRich": "Building a real-time analytics dashboard …",
    "solution": "Event-sourced architecture with MongoDB change streams …",
    "solutionRich": "Event-sourced architecture with MongoDB change streams …",
    "results": [
      { "metric": "Page Load", "value": "0.9s", "description": "P95 load time" },
      { "metric": "Real-time Events", "value": "100k/day", "description": "…" }
    ],
    "technologies": ["MongoDB", "Express", "React", "Node.js", "Redis", "Recharts"],
    "techStack":    ["MongoDB", "Express", "React", "Node.js", "Redis", "Recharts"],
    "thumbnail":   { "url": "…", "alt": "…" },
    "images":      ["…"],          // legacy flat list
    "gallery":     [{ "url": "…", "alt": "…", "order": 0 }],
    "liveUrl":     "…",
    "githubUrl":   "…",
    "duration":    "8 weeks",
    "completedAt": "2025-04-15T00:00:00.000Z",
    "isFeatured":   true,
    "isPublished":  true,
    "status":      "active",
    "isActive":    true,
    "order":       1,
    "servicesUsed": [{ "_id": "…", "title": "MERN Stack Development", "slug": "mern-stack-development" }],
    "serviceCategory": "…",
    "testimonial": {
      "quote": "…", "author": "…", "role": "…",
      "text": "…", "authorName": "…", "designation": "…",
      "company": "…", "avatar": { "url": "…" }, "rating": 5
    },
    "seo": {
      "metaTitle": "…",
      "metaDescription": "…",
      "ogImage": "…"
    }
  },
  "message": ""
}
```

#### Protected (super_admin)

| Method | Path                                | Description        |
| ------ | ----------------------------------- | ------------------ |
| POST   | `/api/v1/portfolio`                 | Create             |
| PUT    | `/api/v1/portfolio/:id`             | Update             |
| DELETE | `/api/v1/portfolio/:id`             | Soft archive       |

---

### 7.4 Team

#### Public

| Method | Path                              | Cache | Description |
| ------ | --------------------------------- | ----- | ----------- |
| GET    | `/api/v1/public/team`             | 5 m   | All active team members |
| GET    | `/api/v1/public/team/:slug`       | —     | Single member |

**Response shape (single member):**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "name": "Amar Kumar",
    "slug": "amar-kumar",
    "designation": "Founder & Lead MERN Stack Engineer",
    "role": "Founder & Lead MERN Stack Engineer",
    "bio": "Senior full-stack engineer with 8+ years …",
    "avatar": "https://kraviona.com/team/amar.jpg",
    "avatarObj": { "url": "https://kraviona.com/team/amar.jpg", "alt": "Amar Kumar" },
    "email": "amar@kraviona.com",
    "social": {
      "linkedin": "https://linkedin.com/in/kraviona",
      "twitter":  "https://twitter.com/kraviona",
      "github":   "https://github.com/kraviona"
    },
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/kraviona",
      "github":   "https://github.com/kraviona",
      "twitter":  "https://twitter.com/kraviona"
    },
    "skills": ["React.js","Next.js","Node.js","MongoDB","TypeScript","AWS"],
    "order": 1,
    "isActive": true,
    "isPublished": true,
    "joinedAt": "2026-06-02T00:00:00.000Z"
  }
}
```

#### Protected (super_admin)

| Method | Path                          | Description |
| ------ | ----------------------------- | ----------- |
| POST   | `/api/v1/team`                | Create      |
| PUT    | `/api/v1/team/:id`            | Update      |
| DELETE | `/api/v1/team/:id`            | Soft archive |
| PUT    | `/api/v1/team/reorder`        | Bulk reorder `{ order: [{id, order}] }` |

---

### 7.5 Testimonials

#### Public

| Method | Path                                            | Cache | Description |
| ------ | ----------------------------------------------- | ----- | ----------- |
| GET    | `/api/v1/public/testimonials`                   | 5 m   | All approved + published |
| GET    | `/api/v1/public/testimonials/featured`          | 5 m   | Only `isFeatured: true` |

**Query params:** `showOn=home|gallery|service|case-study|about` (repeatable), `featured=true`, `limit=<n>`

**Response shape:**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "clientName":     "Rohit Sharma",
    "designation":    "CTO",
    "clientRole":     "CTO",
    "company":        "FinStack",
    "clientCompany":  "FinStack",
    "rating":         5,
    "review":         "Kraviona delivered our fintech platform in 9 weeks — …",
    "avatar":     { "url": "…", "alt": "Rohit Sharma" },
    "clientAvatar": "…",
    "showOn":  ["home", "about"],
    "service":  "…(Service _id)",
    "serviceUsed": { "_id": "…", "name": "MERN Stack Development", "slug": "mern-stack-development" },
    "projectRef": { "_id": "…", "title": "…" },
    "platform":        "direct",
    "platformReviewUrl": "",
    "isApproved":  true,
    "isFeatured":  true,
    "isPublished": true,
    "order": 1
  }
}
```

#### Protected (super_admin)

| Method | Path                                       | Description |
| ------ | ------------------------------------------ | ----------- |
| POST   | `/api/v1/testimonials`                     | Create      |
| PUT    | `/api/v1/testimonials/:id`                 | Update      |
| PUT    | `/api/v1/testimonials/:id/approve`         | Toggle approve/publish |
| DELETE | `/api/v1/testimonials/:id`                 | Hard delete |

---

### 7.6 Case Studies

> Empty by default. The case studies page should render an empty state ("Launching Soon") when no `status: "published"` case studies exist.

#### Public

| Method | Path                                  | Description |
| ------ | ------------------------------------- | ----------- |
| GET    | `/api/v1/public/case-studies`         | All published |
| GET    | `/api/v1/public/case-studies/:slug`   | Single published |

**Query params:** `featured=true`, `limit=<n>`

**Response shape:**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "title": "Scaling FinStack to 1M MAU",
    "slug":  "scaling-finstack-1m-mau",
    "client": "FinStack",
    "clientLogo":   { "url": "…" },
    "industry":     "Fintech",
    "heroImage":    { "url": "…", "alt": "…" },
    "tagline":      "300% increase in organic traffic in 90 days",
    "keyMetrics": [
      { "label": "LCP", "before": "2.5s", "after": "0.8s", "improvement": "−68%", "icon": "⏱" }
    ],
    "overview":  "<p>…</p>",
    "challenge": "<p>…</p>",
    "approach":  "<p>…</p>",
    "solution":  "<p>…</p>",
    "results":   "<p>…</p>",
    "servicesUsed": [{ "_id": "…", "title": "MERN Stack Development", "slug": "mern-stack-development" }],
    "technologies": ["Node.js","MongoDB","Redis"],
    "duration": "12 weeks",
    "testimonial": {
      "text": "…", "authorName": "…", "designation": "…",
      "avatar": { "url": "…", "alt": "…" }
    },
    "seo": { "metaTitle": "…", "metaDescription": "…", "keywords": ["…"], "ogImage": "…" },
    "featured":   true,
    "status":     "published",
    "publishedAt":"2025-05-30T00:00:00.000Z",
    "order":      1
  }
}
```

#### Protected (super_admin)

| Method | Path                                | Description |
| ------ | ----------------------------------- | ----------- |
| POST   | `/api/v1/case-studies`              | Create — auto-publishes if `status: "published"` |
| PUT    | `/api/v1/case-studies/:id`          | Update |
| DELETE | `/api/v1/case-studies/:id`          | Hard delete |

---

### 7.7 Pricing

> Gated by `SiteConfig.pricing.isComingSoon`. Until flipped to `false`, the frontend should render a "Coming Soon" placeholder.

#### Public

| Method | Path                          | Cache | Description |
| ------ | ----------------------------- | ----- | ----------- |
| GET    | `/api/v1/public/pricing`      | 10 m  | All active plans |

**Query params:** `category=web-development|seo|maintenance|custom`

**Response shape:**
```jsonc
{
  "success": true,
  "data": {
    "_id": "…",
    "name": "Growth",
    "slug":  "growth",
    "tagline": "For scaling startups",
    "price": {
      "monthly":   49999,
      "quarterly": 134999,
      "yearly":    479999,
      "currency":  "INR",
      "suffix":    "/month",
      "isCustom":  false
    },
    "category": "web-development",
    "isPopular":   false,
    "isHighlighted": true,
    "features": [
      { "text": "Full MERN stack app", "included": true, "tooltip": "" },
      { "text": "Source code ownership","included": true, "tooltip": "MIT license" }
    ],
    "cta": { "text": "Choose Growth", "link": "/contact?plan=growth" },
    "deliverables": ["Source code","Deployment docs","30-day support"],
    "idealFor":  "Seed to Series-A startups",
    "timeframe": "8–12 weeks",
    "order":   2,
    "isActive": true
  }
}
```

#### Protected (super_admin)

| Method | Path                       | Description |
| ------ | -------------------------- | ----------- |
| POST   | `/api/v1/pricing`          | Create      |
| PUT    | `/api/v1/pricing/:id`      | Update      |
| DELETE | `/api/v1/pricing/:id`      | Hard delete |

> Update `SiteConfig.pricing.isComingSoon` to `false` to launch the page.

---

### 7.8 Contact Form

#### `POST /api/v1/public/contact` — Public · rate-limited

Used by every contact form on the site (homepage, services, services detail, contact page, footer).

**Request body:**
```jsonc
{
  "firstName":     "Jane",                   // required
  "lastName":      "Doe",                    // optional
  "email":         "jane@example.com",       // required, valid
  "phone":         "+919876543210",          // optional
  "subject":       "Need a MERN stack MVP",  // optional
  "message":       "We're a 3-person startup looking to …",  // required (min 5 chars)
  "sourcePage":    "/services/mern-stack-development",      // optional
  "sourceService": "mern-stack-development", // optional (service slug)
  "utmSource":     "google",                 // optional
  "utmMedium":     "cpc",                    // optional
  "utmCampaign":   "mern-q2-2026"            // optional
}
```

**Behaviour (spec §8.2):**
1. Saves to `ContactSubmission` collection.
2. Creates a `Lead` (uses existing `Message` model) for CRM.
3. Sends notification email to `SUPPORT_EMAIL` env (or `kravionatech@gmail.com`).
4. Sends auto-reply to the submitter.
5. All email sends are **best-effort** — they never block the response.

**Response:**
```jsonc
// 201 Created
{ "success": true, "message": "Thank you! Your message has been received.",
  "data": { "id": "<ContactSubmission _id>", "leadId": "<Message _id>" } }

// 400 Bad Request
{ "success": false, "message": "Validation failed",
  "errors": { "email": ["Valid email is required"], "message": ["…"] } }
```

---

### 7.9 Newsletter

#### `POST /api/v1/public/newsletter/subscribe` — Public

**Request body:**
```jsonc
{ "email": "user@example.com" }
```

**Behaviour (spec §9.2):**
1. If email already exists → 200 with `alreadySubscribed: true`.
2. If new → save + send welcome email → 201 with `alreadySubscribed: false`.

**Response:**
```jsonc
// 201 Created
{ "success": true, "message": "Subscribed successfully",
  "data": { "email": "user@example.com", "status": "subscriber", "alreadySubscribed": false } }

// 200 OK (already subscribed)
{ "success": true, "message": "Already subscribed!",
  "data": { "email": "user@example.com", "status": "subscriber", "alreadySubscribed": true } }
```

---

## 8. API Surface — `/api/*` (Existing / Preserved)

> These existed before the dynamization work and remain untouched. They are mentioned here for the frontend, but **the spec routes in §7 are the recommended source of truth** for new pages.

### 8.1 Auth (legacy)

| Method | Path                            | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | `/api/auth/create-account`      | Sign up + send OTP        |
| POST   | `/api/auth/verify-account`      | Verify OTP                |
| POST   | `/api/auth/resend-otp`          | Resend OTP                |
| POST   | `/api/auth/login-otp`           | OTP-based login           |
| POST   | `/api/auth/login-password`      | Password login            |
| PUT    | `/api/auth/edit-account`        | Update profile            |
| POST   | `/api/auth/refresh-token`       | Refresh access token      |
| POST   | `/api/auth/logout`              | Blacklist refresh token   |

### 8.2 Blog / Posts

| Method | Path                                | Auth          | Description                |
| ------ | ----------------------------------- | ------------- | -------------------------- |
| GET    | `/api/posts`                        | Public        | Paginated published posts  |
| GET    | `/api/post/:slug`                   | Public        | Single post (auto +1 view) |
| GET    | `/api/posts/category/:slug`         | Public        | Posts by category slug     |
| POST   | `/api/post/create`                  | super_admin   | Create post                |
| PUT    | `/api/post/:slug`                   | super_admin   | Update post                |
| DELETE | `/api/post/:slug`                   | super_admin   | Delete post                |
| PUT    | `/api/keywords/:slug`               | super_admin   | Replace keywords           |
| PUT    | `/api/post/reaction/:slug`          | Public        | Body: `{type: "like"\|"dislike"\|"share"}` |

### 8.3 Categories (blog)

| Method | Path                          | Auth          | Description                |
| ------ | ----------------------------- | ------------- | -------------------------- |
| GET    | `/api/categories/public`      | Public        | All published categories   |
| GET    | `/api/category/:slug`          | Public        | Single category by slug    |
| POST   | `/api/category/new`           | super_admin   | Create                     |
| GET    | `/api/categories/admin`       | super_admin   | All categories incl. drafts |
| PUT    | `/api/category/:id`           | super_admin   | Update                     |
| DELETE | `/api/category/:id`           | super_admin   | Delete                     |

### 8.4 Messages / Leads (CRM)

| Method | Path                                  | Auth          | Description |
| ------ | ------------------------------------- | ------------- | ----------- |
| POST   | `/api/client/send-message`            | Public        | Legacy contact-form endpoint (still works) |
| GET    | `/api/admin/messages`                 | super_admin   | Paginated list, filter by `status`, `source`, `isRead` |
| GET    | `/api/admin/messages/:id`             | super_admin   | Get + auto-mark read |
| PATCH  | `/api/admin/messages/:id`             | super_admin   | Update `isRead` or `status` |
| DELETE | `/api/admin/messages/:id`             | super_admin   | Delete |
| PATCH  | `/api/admin/messages/:id/assign`      | super_admin   | Assign to a user |
| POST   | `/api/admin/messages/:id/note`        | super_admin   | Add internal note |
| GET    | `/api/admin/leads/stats`              | super_admin   | CRM summary stats |

### 8.5 Subscribers

| Method | Path                              | Auth          | Description |
| ------ | --------------------------------- | ------------- | ----------- |
| POST   | `/api/subscriber/new`             | Public        | Legacy subscribe (still works) — same as `/api/v1/public/newsletter/subscribe` |
| GET    | `/api/subscribers`                | super_admin   | Paginated list |
| PUT    | `/api/subscriber/update/:id`      | super_admin   | Update status |
| DELETE | `/api/subscriber/delete/:id`      | super_admin   | Delete |

### 8.6 Services / Portfolio / Team / Testimonials / SiteSettings (legacy module routes)

> **Recommendation: do not use these for new frontend pages.** They are kept for backward compatibility with the existing admin panel. Use the `/api/v1/*` routes from §7 instead.

| Method | Path                                  | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/api/services`                       | Paginated published services |
| GET    | `/api/service/:slug`                  | Single service by slug |
| POST   | `/api/admin/services`                 | Create |
| GET    | `/api/admin/services`                 | All incl. drafts |
| PUT    | `/api/admin/service/:id`              | Update |
| DELETE | `/api/admin/service/:id`              | Delete |
| PATCH  | `/api/admin/service/:id/order`        | Reorder |
| GET    | `/api/projects`                       | Paginated published projects |
| GET    | `/api/project/:slug`                  | Single project by slug |
| POST   | `/api/admin/projects`                 | Create |
| GET    | `/api/admin/projects`                 | All incl. drafts |
| PUT    | `/api/admin/project/:id`              | Update |
| DELETE | `/api/admin/project/:id`              | Delete |
| GET    | `/api/team`                           | Paginated published team |
| POST   | `/api/admin/team`                     | Create |
| GET    | `/api/admin/team`                     | All members |
| PUT    | `/api/admin/team/:id`                 | Update |
| DELETE | `/api/admin/team/:id`                 | Delete |
| GET    | `/api/testimonials`                   | Paginated published testimonials |
| POST   | `/api/admin/testimonials`             | Create |
| GET    | `/api/admin/testimonials`             | All |
| PUT    | `/api/admin/testimonial/:id`          | Update |
| DELETE | `/api/admin/testimonial/:id`          | Delete |
| GET    | `/api/settings/public`                | Public settings key-value map |
| GET    | `/api/admin/settings`                 | All settings (admin) |
| GET    | `/api/admin/settings/:group`          | Filter by group |
| PUT    | `/api/admin/settings`                 | Bulk update |
| PUT    | `/api/admin/settings/:key`            | Single update |

### 8.7 Analytics / Audit / Notifications / Email Campaigns (preserved)

Mounted at `/api/analytics/*`, `/api/audit/*`, `/api/notifications/*`, `/api/email-campaigns/*`, `/api/track/*`. See `src/routes/*.routes.js` for the full surface. These are pre-existing CRM-era modules and were not modified in this dynamization pass.

---

## 9. Media Upload (Cloudinary)

#### `POST /api/upload` — super_admin · `multipart/form-data`

Field: `file` (any image, video, PDF, doc).

```http
POST /api/upload HTTP/1.1
Authorization: Bearer <jwt>
Content-Type: multipart/form-data; boundary=…

--…
Content-Disposition: form-data; name="file"; filename="hero.jpg"
Content-Type: image/jpeg

<binary>
--…
Content-Disposition: form-data; name="filename"

hero
--…--
```

**Response:**
```jsonc
{ "success": true, "message": "File uploaded successfully",
  "data": { "url": "https://res.cloudinary.com/…/hero.jpg", "publicId": "…", "filename": "hero", "alt": "hero" } }
```

Then store the returned `url` in any text/image field of the spec routes (e.g. `siteConfig.hero.image`, `project.thumbnail.url`, `testimonial.avatar.url`).

| Method | Path                | Auth          | Description |
| ------ | ------------------- | ------------- | ----------- |
| GET    | `/api/files`        | super_admin   | List all uploaded media |
| PUT    | `/api/files/:id`    | super_admin   | Update alt text / filename |
| DELETE | `/api/files/:id`    | super_admin   | Delete from Cloudinary + DB |

---

## 10. Data Models Reference (Mongoose Schemas)

> This section is the **canonical reference** for the full shape of each Dynamo spec resource. The collection names below are exactly what Mongoose pluralises by default — use them in raw `db.collection.find()` calls.

### 10.1 `siteconfigs` (single document)

```ts
{
  _id: "kraviona_site_config_v1",          // fixed
  companyName, tagline, description, phone, email, address: String,
  social: { facebook, twitter, linkedin, instagram, youtube: String },
  hero: {
    badge1, badge2, badge3, headline, subheadline, phone: String,
    ctaPrimary:   { text, link },
    ctaSecondary: { text, link }
  },
  stats: {
    projectsDelivered, clientRetention, yearsExperience, support: String,
    projectsLabel, retentionLabel, experienceLabel, supportLabel: String
  },
  whyUs:   { title, subtitle, features: [{ icon, title, description }] },
  whoWeAre:{ title, description, ctaText, ctaLink },
  techStack:[{ category, categoryTitle, description, tools: [{ name, logoUrl }] }],
  homeFaqs: [{ question, answer, order }],
  newsletter: { title, subtitle, placeholder },
  footer: {
    description, copyrightText,
    capabilitiesLinks: [{ label, href }],
    companyLinks:      [{ label, href }]
  },
  about: {
    heroTitle, heroSubtitle, storyTitle, storyContent, storyQuote,
    values: [{ title, description, icon }],
    ctaTitle, ctaSubtitle
  },
  pricing: { title, subtitle, disclaimer, billingToggle, isComingSoon },
  googleAnalyticsId, googleVerification, defaultMetaTitle, defaultMetaDescription, defaultOgImage: String,
  createdAt, updatedAt: Date
}
```

### 10.2 `services`

```ts
{
  name, title, slug, icon, category, badge: String,
  isPublished, isFeatured, isPopular, isActive: Boolean,
  order: Number,
  shortDesc, longDesc: String,
  whyChoose: { title, bullets: [String] },
  featureCards: [{ number, title, description }],
  faqs:       [{ question, answer, order }],
  technologies: [{ name, logoUrl, subtitle }],
  relatedServices: [ObjectId("Service")],
  pricingPlans: [{ label, price, currency, features, isPopular }],   // legacy
  features, techStack: [String],                                      // legacy
  coverImage, metaTitle, metaDesc: String,                            // legacy
  seo: { metaTitle, metaDescription, keywords, canonicalUrl, ogTitle, ogDescription, ogImage },
  createdAt, updatedAt
}
```

### 10.3 `projects` (Portfolio)

```ts
{
  title, slug: String,
  client, clientName, clientLocation, industry: String,
  clientLogo: { url },                                  // spec
  projectType: "web-app" | "mobile" | "saas" | "ecommerce" | "dashboard" | "api" | "other",
  thumbnail: { url, alt },                              // spec
  images: [String],                                     // legacy
  gallery: [{ url, alt, order }],                       // spec
  description, problem, challenge, challengeRich, solution, solutionRich: String,
  results: [{ metric, value, description }],
  techStack, technologies: [String],                    // both supported
  servicesUsed: [ObjectId("Service")],
  serviceCategory: ObjectId("Service"),                 // legacy
  liveUrl, githubUrl, duration: String,
  completedAt: Date,
  isPublished, isFeatured, isActive: Boolean,
  status: "active" | "archived",
  order: Number,
  testimonial: { quote, text, author, authorName, role, designation, company, avatar: { url }, rating },
  metaTitle, metaDesc: String,                          // legacy
  seo: { metaTitle, metaDescription, ogImage }
}
```

### 10.4 `teammembers`

```ts
{
  name, slug, designation, role, bio: String,           // role/designation aliased
  avatar: String,                                       // legacy single URL
  avatarObj: { url, alt },                              // spec
  email: String,
  social: { linkedin, twitter, github },                // spec
  socialLinks: { linkedin, twitter, github },           // legacy
  skills: [String],
  order: Number,
  isPublished, isActive: Boolean,
  joinedAt: Date
}
```

### 10.5 `testimonials`

```ts
{
  clientName, designation, company, clientRole, clientCompany: String,
  avatar:     { url, alt },       // spec
  clientAvatar: String,            // legacy
  rating: Number (1-5),
  review: String,
  showOn:  ["home"|"gallery"|"service"|"case-study"|"about"],
  serviceUsed, service: ObjectId("Service"),
  projectRef: ObjectId("Project"),
  platform: "google" | "clutch" | "linkedin" | "direct",
  platformReviewUrl: String,
  isApproved, isPublished, isFeatured: Boolean,
  order: Number
}
```

### 10.6 `casestudies`

```ts
{
  title, slug, client, industry: String,
  clientLogo: { url },
  heroImage: { url, alt },
  tagline: String,
  keyMetrics: [{ label, before, after, improvement, icon }],
  overview, challenge, approach, solution, results: String,    // rich HTML
  servicesUsed: [ObjectId("Service")],
  technologies: [String],
  duration: String,
  testimonial: { text, authorName, designation, avatar: { url, alt } },
  seo: { metaTitle, metaDescription, keywords, ogImage },
  featured: Boolean,
  status: "draft" | "published" | "archived",
  publishedAt: Date,
  order: Number
}
```

### 10.7 `pricingplans`

```ts
{
  name, slug, tagline: String,
  price: { monthly, quarterly, yearly, currency, suffix, isCustom },
  category: "web-development" | "seo" | "maintenance" | "custom",
  isPopular, isHighlighted: Boolean,
  features: [{ text, included, tooltip }],
  cta: { text, link },
  deliverables: [String],
  idealFor, timeframe: String,
  order: Number,
  isActive: Boolean
}
```

### 10.8 `contactsubmissions`

```ts
{
  firstName, lastName, email, phone, subject, message: String,
  sourcePage, sourceService: String,
  utmSource, utmMedium, utmCampaign: String,
  status: "new" | "read" | "replied" | "spam",
  ipAddress, userAgent: String,
  leadId: ObjectId("Message")                             // existing lead model
}
```

### 10.9 Pre-existing models (UNCHANGED)

| Collection              | Purpose |
| ----------------------- | ------- |
| `users`                 | User accounts, auth, profile |
| `posts` (blog)          | Blog posts — never modify |
| `categories` (blog)     | Blog categories — never modify |
| `comments`              | Blog comments |
| `messages`              | Leads / contact-form submissions — re-used by `/api/v1/public/contact` |
| `subscribers`           | Newsletter subscribers — re-used by `/api/v1/public/newsletter/subscribe` |
| `media`                 | Cloudinary media metadata |
| `sessions`              | Refresh-token sessions |
| `tokenblacklists`       | Logged-out refresh tokens |
| `sitesettings`          | Legacy key/value settings store (do not use for new work) |
| `notifications`         | In-app notifications |
| `auditlogs`             | Admin action audit log |
| `pageviews`             | Page-level analytics |
| `postanalytics`         | Per-post analytics |

---

## 11. Frontend Fetch Helpers

### 11.1 Server-side fetch with ISR (Next.js 14 App Router)

```ts
// lib/api.ts
const API = process.env.API_URL ?? "http://localhost:5000/api";

export async function fetchAPI<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${endpoint}`, {
    ...init,
    next: { revalidate: 300 },          // 5-minute ISR
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${endpoint} → ${res.status}`);
  const json = await res.json();
  return json.data as T;                 // strip the envelope
}

// Convenience: any authenticated call (use only in server actions / route handlers)
export async function fetchAPIProtected<T>(endpoint: string, token: string, init?: RequestInit): Promise<T> {
  return fetchAPI<T>(endpoint, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } });
}
```

### 11.2 Client-side mutation helper

```ts
// lib/apiClient.ts
"use client";
export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json.data as T;
}
```

### 11.3 generateMetadata for [slug] pages

```ts
// app/services/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const s = await fetchAPI<any>(`/v1/public/services/${params.slug}`);
    return {
      title:       s.seo?.metaTitle       || s.title,
      description: s.seo?.metaDescription || s.shortDesc,
      openGraph: {
        title:       s.seo?.ogTitle       || s.title,
        description: s.seo?.ogDescription || s.shortDesc,
        images:      s.seo?.ogImage ? [s.seo.ogImage] : [],
        url:         s.seo?.canonicalUrl,
      },
    };
  } catch {
    return {};
  }
}
```

### 11.4 generateStaticParams for SSG

```ts
export async function generateStaticParams() {
  const services = await fetchAPI<any[]>("/v1/public/services");
  return services.map((s) => ({ slug: s.slug }));
}
```

---

## 12. AI Agent — Review Checklist & CRM Integration Guide

> Drop this section into any LLM prompt when asking for CRM / client-side code review.

### 12.1 What the system is

A Node.js + Express + Mongoose + Redis backend serving kraviona.com. The frontend (Next.js 14) is being migrated from hardcoded JSX to dynamic API calls. Routes live under two prefixes:

- **`/api/v1/*`** — new dynamization-spec routes (USE THESE for new code).
- **`/api/*`** — pre-existing CRM-era routes (PRESERVE for backward compat; do not duplicate).

### 12.2 CRM integration review checklist

When reviewing a client-side or CRM-related change, verify **each** item:

#### A. Data fetching

- [ ] Frontend uses `/api/v1/*` routes for new pages, not the legacy `/api/*` ones.
- [ ] Every public fetch uses `fetchAPI(...)` with `next: { revalidate: 300 }` (5-min ISR).
- [ ] Every `[slug]` page implements `generateMetadata()` using `seo.*` fields from the response.
- [ ] Service-detail, project-detail, case-study-detail, team-member pages implement `generateStaticParams()`.
- [ ] Empty-state UI is shown when `data` is an empty array (e.g. case studies, pricing when `isComingSoon === true`).

#### B. Caching & invalidation

- [ ] Public GET routes are wrapped in `cacheMiddleware(scope, ttl)`.
- [ ] Any `POST / PUT / DELETE` on a protected route calls `invalidateCache(scope)`.
- [ ] TTLs match spec §12: site-config 600s · services 300s · servicesNav 1800s · team 300s · portfolio 300s · testimonials 300s · pricing 600s.
- [ ] `x-cache: HIT | MISS` header is logged/observed in DevTools to confirm caching is active.

#### C. Authentication

- [ ] Protected routes are wrapped with `authMiddleWare` then `roleCheck("super_admin")`.
- [ ] No role check is loose to `("admin")` unless explicitly intended.
- [ ] JWT is read from `Authorization: Bearer …` (never from a cookie for the spec routes).
- [ ] `refresh-token` is used to renew `accessToken` before expiry.

#### D. Response envelope

- [ ] Every handler returns `{ success, data, message }`.
- [ ] On validation error, `errors: { field: [messages] }` is included.
- [ ] Status codes match the table in §4.
- [ ] No handler returns a raw Mongoose document (use `.lean()` or strip `_id`/`__v`).

#### E. Contact form

- [ ] Frontend POSTs `{ firstName, email, message, … }` to `/api/v1/public/contact` (NOT `/api/client/send-message`).
- [ ] On 201, form clears and shows a success toast.
- [ ] On 400, field-level errors are shown next to inputs.
- [ ] `sourcePage` and `sourceService` are auto-attached by the frontend.

#### F. Newsletter

- [ ] POSTs `{ email }` to `/api/v1/public/newsletter/subscribe`.
- [ ] On `alreadySubscribed: true` (200), the UI shows the "Already subscribed" checkmark.
- [ ] On 201, the UI shows the success checkmark.

#### G. SEO & metadata

- [ ] `generateMetadata()` uses `seo.metaTitle` / `seo.metaDescription` (NOT hardcoded).
- [ ] `ogImage` defaults to `siteConfig.defaultOgImage` if the entity doesn't have one.
- [ ] Sitemap reads `/api/v1/public/portfolio`, `/api/v1/public/services`, `/api/v1/public/case-studies`, `/api/posts`.

#### H. CRM lead flow

- [ ] Every `POST /api/v1/public/contact` ALSO creates a `Message` (Lead) record. Verify by reading `data.leadId` from the response.
- [ ] The admin `/api/admin/messages` endpoint paginates with `?page=&limit=&status=&source=`.
- [ ] Lead statuses follow: `new → contacted → in-progress → closed | spam`.
- [ ] Notes and assignment go through `/api/admin/messages/:id/note` and `/api/admin/messages/:id/assign`.

#### I. Rate limiting & abuse

- [ ] Public forms respect 429 responses and back off (UI shows a "Too many requests" toast).
- [ ] No form bypasses the 100-req / 15-min limit (the limiter is global on `/api`).

#### J. Database integrity

- [ ] New Mongoose fields are **additive** (no required:true on existing optional fields).
- [ ] `pre-save` slug generation is preserved.
- [ ] Soft-delete via `isActive: false` (or `status: "archived"` for projects), not hard delete.

### 12.3 Common gaps to flag in review

If you see ANY of these in the diff, raise a comment:

1. **Hardcoded text in JSX** that exists in `SiteConfig` → replace with `siteConfig.<field>`.
2. **Hardcoded service list** → replace with `await fetchAPI("/v1/public/services")`.
3. **Hardcoded nav dropdown** → replace with `await fetchAPI("/v1/public/services/nav", { next: { revalidate: 3600 } })`.
4. **Contact form posting to `/api/client/send-message`** → update to `/api/v1/public/contact`.
5. **Newsletter posting to `/api/subscriber/new`** → update to `/api/v1/public/newsletter/subscribe`.
6. **Missing `generateMetadata`** on a `[slug]` page.
7. **`useEffect` fetching initial data** on a server-rendered page → use `await fetchAPI(...)` in the page component.
8. **Pricing page without `isComingSoon` check** → render "Coming Soon" when `siteConfig.pricing.isComingSoon === true`.
9. **Testimonial rendering without `isApproved` filter** → backend already filters; verify the frontend doesn't bypass with a direct DB query.
10. **No cache invalidation after admin update** → check the controller calls `invalidateCache(scope)`.

### 12.4 Suggested prompts for AI agents

- _"Review this PR against §12.1 and §12.2 of `API_GUIDE.md`. List every failed checklist item with the file and line."_
- _"Given `/api/v1/public/services` returns the shape in §7.2, generate a TypeScript type for it."_
- _"Find every `axios.get(`, `fetch(`, and `useEffect` in the frontend that doesn't go through `lib/api.ts`."_
- _"Generate a Next.js server component for the services list page using §7.2 + §11.1 + §11.3."_

---

## 13. Per-Page Data Requirements (kraviona.com)

This matrix tells the frontend (or an AI agent) **exactly which endpoint powers which page**.

| Page                              | Endpoint(s)                                                                                          | Notes |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ----- |
| `/` (Home)                        | `/api/v1/public/site-config`<br>`/api/v1/public/services?limit=5`<br>`/api/v1/public/testimonials?showOn=home&featured=true`<br>`/api/posts?limit=3&status=published` | Hero, whyUs, whoWeAre, techStack, homeFaqs, newsletter, footer all come from site-config |
| `/services`                       | `/api/v1/public/services`                                                                            | Optional group by `category` |
| `/services/[slug]`                | `/api/v1/public/services/:slug`                                                                      | Use `generateMetadata` + `generateStaticParams` |
| `/about`                          | `/api/v1/public/site-config` (use `.about`)<br>`/api/v1/public/team`                                  | |
| `/gallery`                        | `/api/v1/public/portfolio`                                                                           | Filter tabs by `projectType` |
| `/case-studies`                   | `/api/v1/public/case-studies`                                                                        | If empty → render "Launching Soon" |
| `/case-studies/[slug]`            | `/api/v1/public/case-studies/:slug`                                                                  | |
| `/pricing`                        | `/api/v1/public/site-config` (read `pricing.isComingSoon`)<br>`/api/v1/public/pricing` (if launched) | |
| `/contact`                        | `POST /api/v1/public/contact`                                                                        | |
| `/blog` (existing)                | `/api/posts`                                                                                          | Unchanged — DO NOT MODIFY |
| `/blog/[slug]`                    | `/api/post/:slug`                                                                                     | Unchanged — DO NOT MODIFY |
| `/blog/category/[slug]`           | `/api/posts/category/:slug`                                                                           | Unchanged — DO NOT MODIFY |
| Footer (every page)               | `siteConfig.footer`, `siteConfig.social`                                                              | + newsletter form |
| Nav services dropdown             | `/api/v1/public/services/nav` (30 min revalidate)                                                    | |

---

## Appendix A — Environment variables

```env
# Hard required
PORT=5000
MONGODB_URI=mongodb+srv://…
MONGODB_DB_NAME=kraviona_db
JWT_SECRET_KEY=replace_with_a_long_random_secret

# Optional
REDIS_URL=redis://localhost:6379          # omit to use in-memory cache
FRONTEND_CORS=https://kraviona.com
ADMIN_CORS=https://admin.kraviona.com
BACKENDAPI_CORS=https://api.kraviona.com
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
RESEND_API_KEY=re_…
RESEND_FROM_EMAIL=noreply@kraviona.com
SUPPORT_EMAIL=support@kraviona.com
SKIP_SITE_SEED=0                          # set to 1 to disable auto-seed on boot
```

## Appendix B — npm scripts

```jsonc
{
  "start":  "node server.js",
  "dev":    "nodemon server.js",
  "seed":   "node src/scripts/seedSiteData.js",   // idempotent site seed
  "test":   "jest"
}
```

## Appendix C — Idempotent seed

Running `npm run seed` (or letting it run on boot) populates:

| Collection      | Document(s)                            |
| --------------- | -------------------------------------- |
| `siteconfigs`   | 1 (fixed _id)                          |
| `services`      | 13 (11 core + web-app-development + ui-ux-design) |
| `teammembers`   | 1 (Amar Kumar)                         |
| `projects`      | 4 sample projects                      |
| `testimonials`  | 5 approved + featured, showOn=["home"]  |
| `casestudies`   | 0 (intentionally empty)                |
| `pricingplans`  | 0 (intentionally empty; pricing still coming soon) |

> Safe to re-run — every operation is `findOneAndUpdate(..., {upsert: true})`.

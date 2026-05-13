# Kraviona Backend — Full API Guide
**Base URL:** `https://api.yourdomain.com/api`
**Auth Header:** `Authorization: Bearer <accessToken>`

---

## 📦 Standard Response Formats

```js
// List
{ success: true, data: [], total: 100, page: 1, limit: 20, totalPages: 5 }
// Single
{ success: true, data: {} }
// Create/Update/Delete
{ success: true, message: "Resource created successfully", data: {} }
// Error
{ success: false, message: "Error description", errors: { field: ["msg"] } }
```

---

## 🔐 AUTH

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/create-account` | — | `name, email, username, phone, password` |
| POST | `/auth/verify-account` | — | `identifier, otp` |
| POST | `/auth/resend-otp` | — | `identifier` |
| POST | `/auth/login-otp` | — | `identifier, otp` |
| POST | `/auth/login-password` | — | `identifier, password` |
| PUT | `/auth/edit-account` | 🔒 | `username, phone, bio, jobTitle` |
| POST | `/auth/refresh-token` | — | `token (refreshToken)` |
| POST | `/auth/logout` | 🔒 | `token (refreshToken)` |

Login returns: `{ token: { accessToken, refreshToken } }`

### Frontend Auth Helper
```js
// lib/api.js
export const API = process.env.NEXT_PUBLIC_API_URL + '/api';

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });
  return res.json();
};
```

---

## 📝 POSTS

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/posts?page=1&limit=10` | — |
| GET | `/post/:slug` | — |
| GET | `/posts/category/:slug` | — |
| POST | `/post/create` | 🔒 |
| PUT | `/post/:slug` | 🔒 |
| DELETE | `/post/:slug` | 🔒 |
| PUT | `/post/reaction/:slug` | — |
| PUT | `/keywords/:slug` | 🔒 |

**Create post body:**
```json
{
  "title": "My Post", "slug": "my-post",
  "content": "Full content...", "excerpt": "Summary (max 200 chars)",
  "categoryID": "<ObjectId>",
  "featuredImage": {
    "small":  { "url": "https://...", "altText": "Alt", "width": 400,  "height": 300 },
    "medium": { "url": "https://...", "altText": "Alt", "width": 800,  "height": 600 },
    "large":  { "url": "https://...", "altText": "Alt", "width": 1200, "height": 900 }
  }
}
```

**Reaction:** `{ "type": "like" }` — values: `like | dislike | share`

---

## 🛠️ SERVICES (Module 1)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/services?page=1&limit=20` | — |
| GET | `/service/:slug` | — |
| POST | `/admin/services` | 🔒 Admin |
| GET | `/admin/services?isPublished=true` | 🔒 |
| PUT | `/admin/service/:id` | 🔒 Admin |
| DELETE | `/admin/service/:id` | 🔒 Admin |
| PATCH | `/admin/service/:id/order` | 🔒 Admin |

**Create body:**
```json
{
  "name": "Web Development",
  "shortDesc": "We build fast websites (max 160 chars)",
  "longDesc": "<p>Full HTML description</p>",
  "icon": "🌐",
  "coverImage": "https://cloudinary.com/...",
  "features": ["Responsive Design", "SEO Optimized"],
  "techStack": ["React", "Node.js", "MongoDB"],
  "pricingPlans": [
    { "label": "Starter", "price": 15000, "currency": "INR", "features": ["5 pages"], "isPopular": false },
    { "label": "Pro", "price": 35000, "currency": "INR", "features": ["Unlimited pages"], "isPopular": true }
  ],
  "isFeatured": true, "isPublished": true, "order": 1,
  "metaTitle": "Web Dev Services", "metaDesc": "We build modern web apps"
}
```
**Reorder:** `PATCH /admin/service/:id/order` → `{ "order": 3 }`

---

## 💼 PROJECTS (Module 2)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/projects?page=1&limit=12&category=slug` | — |
| GET | `/project/:slug` | — |
| POST | `/admin/projects` | 🔒 Admin |
| GET | `/admin/projects` | 🔒 |
| PUT | `/admin/project/:id` | 🔒 Admin |
| DELETE | `/admin/project/:id` | 🔒 Admin |

**Create body:**
```json
{
  "title": "E-commerce App", "clientName": "Rahul Sharma",
  "clientLocation": "Mumbai, India",
  "description": "Full-stack e-commerce platform",
  "problem": "Client needed an online store",
  "solution": "Built with Next.js + Node API",
  "techStack": ["Next.js", "Node.js", "MongoDB"],
  "serviceCategory": "<ServiceObjectId>",
  "images": ["https://cloudinary.com/img1.jpg"],
  "liveUrl": "https://project.com", "githubUrl": "https://github.com/...",
  "duration": "3 months", "completedAt": "2025-12-01",
  "isFeatured": true, "isPublished": true,
  "results": [{ "metric": "Load Time", "value": "1.2s" }],
  "testimonial": { "quote": "Excellent!", "author": "Rahul", "role": "CEO" }
}
```

---

## ⭐ TESTIMONIALS (Module 3)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/testimonials?featured=true&page=1` | — |
| POST | `/admin/testimonials` | 🔒 Admin |
| GET | `/admin/testimonials` | 🔒 |
| PUT | `/admin/testimonial/:id` | 🔒 Admin |
| DELETE | `/admin/testimonial/:id` | 🔒 Admin |

**Create body:**
```json
{
  "clientName": "Priya Singh", "clientRole": "CTO",
  "clientCompany": "TechCorp", "clientAvatar": "https://cloudinary.com/avatar.jpg",
  "rating": 5, "review": "Amazing service! Highly recommend.",
  "serviceUsed": "<ServiceObjectId>", "projectRef": "<ProjectObjectId>",
  "isPublished": true, "isFeatured": true
}
```

---

## 👥 TEAM (Module 4)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/team` | — |
| POST | `/admin/team` | 🔒 Admin |
| GET | `/admin/team` | 🔒 |
| PUT | `/admin/team/:id` | 🔒 Admin |
| DELETE | `/admin/team/:id` | 🔒 Admin |

**Create body:**
```json
{
  "name": "Amar Khan", "role": "Lead Developer",
  "bio": "10 years MERN stack experience",
  "avatar": "https://cloudinary.com/amar.jpg",
  "skills": ["React", "Node.js", "MongoDB", "AWS"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/amar",
    "github": "https://github.com/amar",
    "twitter": "https://twitter.com/amar"
  },
  "order": 1, "isPublished": true
}
```

---

## 📊 ANALYTICS (Module 5)

### Tracking (Public — call from frontend)

**POST `/track/pageview`**
```json
{ "path": "/blog/my-post", "referrer": "https://google.com", "sessionId": "uuid" }
```

**POST `/track/event`**
```json
// Scroll depth (0-100%)
{ "type": "scroll", "postSlug": "my-post", "value": 75 }
// Reaction
{ "type": "reaction", "postSlug": "my-post", "value": "like" }
// Read duration (seconds)
{ "type": "duration", "sessionId": "uuid", "value": 120 }
```

### Frontend Tracking Snippet
```js
// utils/track.js — call on every page change
export const trackPage = (path) => {
  let sid = localStorage.getItem('k_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('k_sid', sid);
  }
  fetch(`${API}/track/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, referrer: document.referrer, sessionId: sid })
  }).catch(() => {});
};

// Call on scroll (throttled)
export const trackScroll = (postSlug, depth) => {
  fetch(`${API}/track/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'scroll', postSlug, value: depth })
  }).catch(() => {});
};
```

### Admin Analytics Reports (all support `?from=YYYY-MM-DD&to=YYYY-MM-DD`)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/admin/analytics/overview` | views, visitors, pctChange |
| GET | `/admin/analytics/visitors` | daily chart, device breakdown |
| GET | `/admin/analytics/pages` | top 20 pages by views |
| GET | `/admin/analytics/posts` | per-post views, readTime, reactions |
| GET | `/admin/analytics/realtime` | last 5 min active visitors |
| GET | `/admin/analytics/devices` | device/browser/OS % |
| GET | `/admin/analytics/geo` | top 50 countries |

---

## 💬 MESSAGES / CRM (Module 6)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/client/send-message` | — | Contact form |
| GET | `/admin/messages?page=1&limit=10` | 🔒 | All messages |
| GET | `/admin/messages/:id` | 🔒 | Single message |
| PATCH | `/admin/messages/:id` | 🔒 | Update status/isRead |
| DELETE | `/admin/messages/:id` | 🔒 | Delete |
| PATCH | `/admin/messages/:id/assign` | 🔒 | Assign to team member |
| POST | `/admin/messages/:id/note` | 🔒 | Add internal note |
| GET | `/admin/leads/stats` | 🔒 | CRM summary |

**Contact form body:**
```json
{
  "firstName": "Rahul", "lastName": "Verma",
  "email": "r@b.com", "phone": "+919876543210",
  "subject": "Need a website", "message": "I want an e-commerce site",
  "budget": "₹50k-1L", "timeline": "3 months", "source": "contact-form"
}
```
Source values: `contact-form | service-page | blog-cta`

**Update status:** `{ "status": "contacted" }`
Status values: `new | contacted | in-progress | closed | spam`

**Add note:** `{ "text": "Called client, follow up next week" }`

**Assign:** `{ "userId": "<UserObjectId>" }`

**Leads stats response:**
```json
{ "total": 45, "new": 12, "contacted": 8, "inProgress": 5,
  "closed": 18, "spam": 2, "thisWeek": 7, "conversionRate": "40.0%" }
```

---

## ⚙️ SITE SETTINGS (Module 7)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/settings/public` | — |
| GET | `/admin/settings` | 🔒 |
| GET | `/admin/settings/:group` | 🔒 |
| PUT | `/admin/settings` | 🔒 Admin |
| PUT | `/admin/settings/:key` | 🔒 Admin |

Groups: `general | seo | social | homepage | footer | contact | integrations`

**All setting keys:**
`site_name, site_tagline, site_logo, site_favicon`
`hero_headline, hero_subheadline, hero_cta_text, hero_cta_link`
`about_text, about_image`
`contact_email, contact_phone, contact_address`
`social_linkedin, social_github, social_twitter, social_instagram`
`seo_title, seo_description, seo_og_image`
`footer_copyright, footer_links`
`ga_id, fb_pixel_id`

**Bulk update:**
```json
[
  { "key": "hero_headline", "value": "New Headline" },
  { "key": "contact_email", "value": "new@email.com" }
]
```

**Frontend usage:**
```js
const { data: settings } = await apiFetch('/settings/public');
// settings.hero_headline, settings.site_name, settings.contact_email, etc.
```

---

## 🔔 NOTIFICATIONS (Module 8)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/admin/notifications?page=1&limit=20` | 🔒 |
| PATCH | `/admin/notifications/read-all` | 🔒 |
| PATCH | `/admin/notifications/:id/read` | 🔒 |
| DELETE | `/admin/notifications/:id` | 🔒 |

List response includes `unreadCount` field for badge display.
Types: `new_message | new_subscriber | post_milestone | campaign_sent | system`

---

## 📋 AUDIT LOGS (Module 9)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/admin/audit-logs?page=1&resource=Post&from=...&to=...` | 🔒 Admin |
| GET | `/admin/audit-logs/user/:userId` | 🔒 Admin |

---

## 📧 EMAIL CAMPAIGNS (Module 10)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/admin/campaigns` | 🔒 Admin |
| GET | `/admin/campaigns` | 🔒 |
| GET | `/admin/campaign/:id` | 🔒 |
| PUT | `/admin/campaign/:id` | 🔒 Admin |
| DELETE | `/admin/campaign/:id` | 🔒 Admin |
| POST | `/admin/campaign/:id/send` | 🔒 Admin |
| POST | `/admin/campaign/:id/schedule` | 🔒 Admin |

**Create draft:**
```json
{
  "subject": "New Year Offer 🎉",
  "previewText": "Exclusive deals for you",
  "htmlContent": "<h1>Hello!</h1><p>Check our offers...</p>",
  "textContent": "Hello! Check our offers..."
}
```
**Schedule:** `{ "scheduledAt": "2025-06-01T10:00:00.000Z" }`
Status flow: `draft → scheduled → sending → sent | failed`

---

## 📂 CATEGORIES

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/categories/public` | — |
| GET | `/category/:slug` | — |
| POST | `/category/new` | 🔒 |
| PUT | `/category/:id` | 🔒 |
| DELETE | `/category/:id` | 🔒 |

---

## 🖼️ MEDIA UPLOAD

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/upload` | 🔒 |
| GET | `/files` | 🔒 |
| PUT | `/files/:id` | 🔒 |
| DELETE | `/files/:id` | 🔒 |

`POST /upload` — `multipart/form-data`, field name: `file`
Returns: `{ url, publicId }`

---

## 📩 SUBSCRIBERS

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/subscriber/new` | — |
| GET | `/subscribers` | 🔒 |

Subscribe: `{ "email": "user@example.com" }`

---

## 🔑 Role Permissions

| Role | Permissions |
|------|------------|
| `super_admin` | Everything including admin account management |
| `admin` | Full CRUD on all 10 modules |
| `editor` | Create/edit own blog posts only |
| `viewer` | Read-only admin dashboard |
| `user` | Public frontend actions only |

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation failed / bad input |
| 401 | No token / expired / blacklisted token |
| 403 | Role not allowed for this action |
| 404 | Resource not found |
| 409 | Duplicate (slug/email already exists) |
| 429 | Rate limit exceeded (wait and retry) |
| 500 | Internal server error |

---

## 🏗️ Admin Panel Integration Snippets

### Auth
```js
// Login
const { token } = await apiFetch('/auth/login-password', {
  method: 'POST',
  body: JSON.stringify({ identifier, password })
});
localStorage.setItem('accessToken', token.accessToken);
localStorage.setItem('refreshToken', token.refreshToken);

// Logout
await apiFetch('/auth/logout', {
  method: 'POST',
  body: JSON.stringify({ token: localStorage.getItem('refreshToken') })
});
localStorage.clear();
```

### Dashboard
```js
const { data } = await apiFetch('/admin/analytics/overview?from=2025-01-01');
// data.views, data.visitors, data.pctChange

const { unreadCount } = await apiFetch('/admin/notifications?limit=1');
const { data: stats } = await apiFetch('/admin/leads/stats');
```

### Service CRUD
```js
const { data } = await apiFetch('/admin/services');
await apiFetch('/admin/services', { method: 'POST', body: JSON.stringify(form) });
await apiFetch(`/admin/service/${id}`, { method: 'PUT', body: JSON.stringify({ isPublished: true }) });
await apiFetch(`/admin/service/${id}/order`, { method: 'PATCH', body: JSON.stringify({ order: 2 }) });
await apiFetch(`/admin/service/${id}`, { method: 'DELETE' });
```

### Settings editor
```js
// Load all settings for admin form
const { data: settings } = await apiFetch('/admin/settings');

// Save changes
await apiFetch('/admin/settings', {
  method: 'PUT',
  body: JSON.stringify([
    { key: 'hero_headline', value: formValues.hero_headline },
    { key: 'contact_email', value: formValues.contact_email }
  ])
});
```

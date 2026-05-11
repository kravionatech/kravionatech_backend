# Kraviona Backend API Documentation

A scalable and secure REST API built using **Node.js** and **Express.js** for the Kraviona web application. This backend handles user authentication, content management, media uploads, messaging, categories, and subscriber management.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Authentication System](#authentication-system)
9. [How to Use](#how-to-use)
10. [Common Use Cases](#common-use-cases)
11. [Error Handling](#error-handling)
12. [Deployment](#deployment)

---

## 🎯 Project Overview

The Kraviona Backend is a full-featured content management and media sharing platform that provides:

- **User Authentication** - Sign up, login with OTP or password, account verification
- **Content Management** - Create, publish, update, and delete posts with SEO optimization
- **Category Management** - Organize content into categories and subcategories
- **Media Management** - Upload, manage, and serve media files via Cloudinary
- **Messaging System** - Send and manage messages with admin notification
- **Subscriber Management** - Manage email subscribers for newsletters
- **Security** - JWT-based authentication, password hashing, OTP verification
- **Email Services** - OTP delivery, verification emails via Resend

---

## 🛠️ Tech Stack

### Backend Framework
- **Express.js** (v5.2.1) - Fast and minimal web framework
- **Node.js** - JavaScript runtime environment

### Database
- **MongoDB** (v9.2.4) - NoSQL database via Mongoose ODM

### Authentication & Security
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing and encryption
- **crypto** - Additional cryptographic operations

### File Management
- **Cloudinary** - Cloud-based media storage and CDN
- **Multer** - Multipart form data handling for file uploads

### Email Services
- **Nodemailer** - Email delivery service
- **Resend** - Modern email API for transactional emails

### Utilities
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **morgan** - HTTP request logging
- **slugify** - URL-friendly slug generation
- **ua-parser-js** - User agent parsing

### Development Tools
- **Nodemon** - Auto-restart during development
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud like MongoDB Atlas)
- **Cloudinary** account (for media storage)
- **Resend** API key (for email services)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd kravionatech_backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment Variables File
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables
Edit `.env` with your credentials (see [Environment Variables](#environment-variables) section)

### Step 5: Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: `http://localhost:5000`)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ===== Server Configuration =====
PORT=5000
NODE_ENV=development

# ===== Database Configuration =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=kraviona_db

# ===== Authentication =====
JWT_SECRET_KEY=your_super_secret_jwt_key_min_32_characters_long

# ===== CORS Configuration =====
FRONTEND_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
BACKENDAPI_CORS=http://localhost:5000

# ===== Cloudinary (Media Storage) =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===== Email Services (Resend) =====
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@kraviona.com
SUPPORT_EMAIL=support@kraviona.com

# ===== Crypto (Optional for data encryption) =====
CRYPTO_KEY=your_32_character_encryption_key
```

### How to Get These Credentials:

**MongoDB Atlas**:
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get the connection string

**Cloudinary**:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, and API Secret from dashboard

**Resend**:
1. Sign up at [resend.com](https://resend.com)
2. Create API key from settings
3. Verify your domain or use their sandbox

**JWT Secret**:
Generate a random string (minimum 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📁 Project Structure

```
kravionatech_backend/
├── server.js                    # Main entry point
├── crypto.js                    # Cryptographic utilities
├── package.json                 # Project dependencies
├── README.md                    # Documentation
│
├── public/
│   └── uploads/                 # Local file uploads storage
│
└── src/
    ├── app.js                   # Express app configuration
    ├── config/
    │   ├── config.js            # Environment variables validation
    │   ├── db.js                # MongoDB connection
    │   └── cloudinary.js        # Cloudinary configuration
    │
    ├── controllers/             # Business logic
    │   ├── user.controller.js
    │   ├── post.controller.js
    │   ├── media.controller.js
    │   ├── messages.controller.js
    │   ├── category.controller.js
    │   └── subcriber.controller.js
    │
    ├── models/                  # Mongoose schemas
    │   ├── user.model.js
    │   ├── post.model.js
    │   ├── media.model.js
    │   ├── message.model.js
    │   ├── category.model.js
    │   ├── comments.model.js
    │   ├── service.model.js
    │   ├── session.model.js
    │   └── subscriber.model.js
    │
    ├── middleware/              # Custom middleware
    │   ├── authMiddleWare.js    # JWT verification
    │   └── fileUploader.js      # Multer configuration
    │
    ├── routes/                  # API route definitions
    │   ├── user.routes.js
    │   ├── post.routes.js
    │   ├── media.routes.js
    │   ├── messages.routes.js
    │   ├── categories.routes.js
    │   └── subscriber.routes.js
    │
    └── utils/                   # Utility functions
        ├── authTokenGenerate.js # JWT token generation
        ├── email.js             # Email sending utilities
        ├── optGenerator.js      # OTP generation
        └── DateAndTimeFormat.js # Date/Time formatting
```

---

## 📊 Database Models

### 1. User Model

Handles user accounts, authentication, and profiles.

```javascript
{
  // Basic Info
  name: String (required, 3-50 chars, alphabets only)
  email: String (required, unique, valid email)
  username: String (required, unique, 3-32 chars)
  phone: String (required, unique, with country code)
  avatar: String (URL, default provided)

  // Authentication
  password: String (required if not OAuth)
  role: String (enum: "user", "admin", "editor", "author")
  isActive: Boolean (default: true)

  // Security
  loginAttempts: Number
  lockUntil: Date
  lastLoginAt: Date
  passwordResetToken: String
  passwordResetExpires: Date

  // OAuth Support
  authProviders: {
    googleId: String,
    githubId: String
  }

  // Verification
  isVerified: Boolean
  verification: {
    emailOtp: String,
    emailOtpExpires: Date,
    phoneOtp: String,
    phoneOtpExpires: Date
  }

  // Profile
  profile: {
    bio: String (max 500 chars)
    jobTitle: String
    socialLinks: [{
      name: String,
      url: String (valid URL)
    }]
  }

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 2. Post Model

Handles blog posts, articles, and content.

```javascript
{
  // Content
  title: String (required, 10-160 chars, unique)
  slug: String (required, unique, URL-friendly)
  previousSlugs: [{
    slug: String,
    addedAt: Date
  }]
  content: String (required, 10-25000 chars)
  excerpt: String (required, 10-200 chars)
  primaryTopicCluster: String

  // Author & Category
  userID: ObjectId (ref: User, required)
  author: {
    name: String,
    email: String,
    username: String,
    jobTitle: String,
    linkedInUrl: String,
    avatar: String
  }
  categoryID: ObjectId (ref: Category, required)
  category: {
    name: String,
    slug: String
  }

  // Engagement Metrics
  reactions: {
    like: Number (default: 0),
    dislike: Number (default: 0),
    share: Number (default: 0)
  }
  views: Number (default: 0)

  // SEO & Publishing
  readingTimeMinutes: Number
  isPublished: Boolean (default: false)
  publishedAt: Date
  status: String (enum: "draft", "published", "archived")

  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 3. Category Model

Organizes posts into categories.

```javascript
{
  name: String (required, unique)
  slug: String (required, unique, URL-friendly)
  description: String
  image: String (URL)
  isPublished: Boolean (default: true)
  status: String (enum: "draft", "published")
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 4. Media Model

Manages uploaded files and media.

```javascript
{
  userId: ObjectId (ref: User, required)
  url: String (required, Cloudinary URL)
  publicId: String (Cloudinary public ID)
  fileName: String
  fileSize: Number (in bytes)
  fileType: String (mime type)
  altText: String
  description: String
  uploadedAt: Date (auto)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 5. Message Model

Handles contact form messages.

```javascript
{
  name: String (required)
  email: String (required)
  phone: String
  subject: String
  message: String (required)
  status: String (enum: "new", "read", "replied")
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### 6. Subscriber Model

Manages email subscribers.

```javascript
{
  email: String (required, unique)
  status: String (enum: "subscribed", "unsubscribed")
  subscribedAt: Date (auto)
  unsubscribedAt: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints (`/api/auth`)

#### 1. Create Account (Sign Up)
```
POST /api/auth/create-account
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "phone": "+91234567890",
  "password": "SecurePassword123!"
}

Response (201):
{
  "success": true,
  "message": "Account created. OTP sent to email.",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

#### 2. Verify Account (Email Verification)
```
POST /api/auth/verify-account
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Account verified successfully",
  "user": { ... }
}
```

#### 3. Resend OTP
```
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### 4. Login with OTP
```
POST /api/auth/login-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

#### 5. Login with Password
```
POST /api/auth/login-password
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

---

### Post Endpoints (`/api/post`)

#### 1. Create New Post (Protected)
```
POST /api/post/create
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Understanding MongoDB",
  "slug": "understanding-mongodb",
  "content": "MongoDB is a NoSQL database...",
  "excerpt": "Learn the basics of MongoDB",
  "categoryID": "64a1b2c3d4e5f6g7h8i9j0k1",
  "category": {
    "name": "Database",
    "slug": "database"
  }
}

Response (201):
{
  "success": true,
  "message": "Post created successfully",
  "post": { ... }
}
```

#### 2. Get All Published Posts
```
GET /api/posts

Response (200):
{
  "success": true,
  "posts": [ ... ],
  "total": 25
}
```

#### 3. Get Post Details by Slug
```
GET /api/post/:slug

Example: GET /api/post/understanding-mongodb

Response (200):
{
  "success": true,
  "post": { ... }
}
```

#### 4. Get Posts by Category
```
GET /api/posts/category/:slug

Example: GET /api/posts/category/database

Response (200):
{
  "success": true,
  "posts": [ ... ]
}
```

#### 5. Delete Post (Protected)
```
DELETE /api/post/:slug
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### 6. Update Keywords
```
PUT /api/keywords/:slug
Content-Type: application/json

{
  "keywords": ["mongodb", "database", "nosql"]
}

Response (200):
{
  "success": true,
  "message": "Keywords updated"
}
}
```

#### 7. Update Post (Protected)
```
PUT /api/post/:slug
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}

Response (200):
{
  "success": true,
  "message": "Post updated successfully",
  "data": { ... }
}
```

#### 8. Add Reaction to Post
```
PUT /api/post/reaction/:slug
Content-Type: application/json

{
  "like": 1,
  "dislike": 0,
  "share": 0
}

Response (200):
{
  "success": true,
  "message": "Reaction updated successfully",
  "data": { ... }
}
```
---

### Media Upload Endpoints (`/api/upload`)

#### 1. Upload File (Protected)
```
POST /api/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- file: <binary file data>

Response (201):
{
  "success": true,
  "message": "File uploaded successfully",
  "media": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "kraviona/xyz123",
    "fileSize": 102400
  }
}
```

#### 2. Get All Files (Protected)
```
GET /api/files
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "files": [ ... ],
  "total": 10
}
```

#### 3. Delete File (Protected)
```
DELETE /api/files/:id
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### 4. Change File Alt Text (Protected)
```
PUT /api/files/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "altText": "New alt text for SEO"
}

Response (200):
{
  "success": true,
  "message": "Alt text updated"
}
```

---

### Category Endpoints (`/api/category`)

#### 1. Create Category (Protected - Admin)
```
POST /api/category/new
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Technology",
  "slug": "technology",
  "description": "All tech-related content",
  "image": "https://example.com/tech.jpg"
}

Response (201):
{
  "success": true,
  "message": "Category created",
  "category": { ... }
}
```

#### 2. Get Published Categories (Public)
```
GET /api/categories/public

Response (200):
{
  "success": true,
  "categories": [ ... ]
}
```

#### 3. Get Category by Slug (Public)
```
GET /api/category/:slug

Example: GET /api/category/technology

Response (200):
{
  "success": true,
  "category": { ... }
}
```

#### 4. Get All Categories (Protected - Admin)
```
GET /api/categories/admin
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "categories": [ ... ]
}
```

#### 5. Update Category (Protected - Admin)
```
PUT /api/category/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Technology & Innovation",
  "description": "Updated description"
}

Response (200):
{
  "success": true,
  "message": "Category updated"
}
```

#### 6. Delete Category (Protected - Admin)
```
DELETE /api/category/:id
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Category deleted"
}
```

---

### Messages Endpoints (`/api/client & /api/admin`)

#### 1. Send Message (Public)
```
POST /api/client/send-message
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91234567890",
  "subject": "Partnership Inquiry",
  "message": "I'm interested in collaborating..."
}

Response (201):
{
  "success": true,
  "message": "Message sent successfully"
}
```

#### 2. Get All Messages (Protected - Admin)
```
GET /api/admin/messages
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "messages": [ ... ],
  "total": 15
}
```

#### 3. Mark Message as Read (Protected - Admin)
```
PATCH /api/admin/messages/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "read"
}

Response (200):
{
  "success": true,
  "message": "Status updated"
}
```

#### 4. Get Message Details (Protected - Admin)
```
GET /api/admin/messages/:id
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": { ... }
}
```

#### 5. Delete Message (Protected - Admin)
```
DELETE /api/admin/messages/:id
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Message deleted"
}
```

---

### Subscriber Endpoints (`/api/subscriber`)

#### 1. Subscribe (Public)
```
POST /api/subscriber/new
Content-Type: application/json

{
  "email": "john@example.com"
}

Response (201):
{
  "success": true,
  "message": "Subscribed successfully"
}
```

#### 2. Get All Subscribers (Protected - Admin)
```
GET /api/subscribers
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "subscribers": [ ... ],
  "total": 250
}
```

#### 3. Update Subscriber Status (Protected - Admin)
```
PUT /api/subscriber/update/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "unsubscribed"
}

Response (200):
{
  "success": true,
  "message": "Status updated"
}
```

#### 4. Delete Subscriber (Protected - Admin)
```
DELETE /api/subscriber/delete/:id
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Subscriber deleted"
}
```

---

## 🔐 Authentication System

### How Authentication Works

The backend uses **JWT (JSON Web Tokens)** for stateless authentication.

#### Token Structure
```javascript
{
  accessToken: {
    expiresIn: "15m",
    contains: { userId, email, role }
  },
  refreshToken: {
    expiresIn: "7d",
    contains: { userId }
  }
}
```

#### How to Use Authentication

1. **User Signs Up**
   - POST `/api/auth/create-account`
   - Receives confirmation email with OTP

2. **User Verifies Email**
   - POST `/api/auth/verify-account` with OTP
   - Account is verified

3. **User Logs In**
   - POST `/api/auth/login-otp` or `/api/auth/login-password`
   - Receives `accessToken` and `refreshToken`

4. **Make Protected Requests**
   - Include token in header: `Authorization: Bearer {accessToken}`
   - Backend validates token via `authMiddleWare`

#### Protected Endpoints
Any endpoint with `authMiddleWare` requires a valid JWT token:

```bash
curl -X GET http://localhost:5000/api/files \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Token Validation
```javascript
// In authMiddleWare.js
const token = authHeader.split(" ")[1];
const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
req.user = decoded; // Now accessible in controller
```

---

## 📚 How to Use

### Complete Workflow Example

#### Step 1: Create a User Account
```bash
curl -X POST http://localhost:5000/api/auth/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "username": "janesmith",
    "phone": "+919876543210",
    "password": "SecurePass@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Account created. OTP sent to email.",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

#### Step 2: Verify Account with OTP
Check your email for the OTP code, then:
```bash
curl -X POST http://localhost:5000/api/auth/verify-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "otp": "123456"
  }'
```

#### Step 3: Login to Get Tokens
```bash
curl -X POST http://localhost:5000/api/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass@123"
  }'
```

#### Step 4: Upload a Media File
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

#### Step 5: Create a Post
```bash
curl -X POST http://localhost:5000/api/post/create \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js",
    "slug": "getting-started-nodejs",
    "content": "Node.js is a JavaScript runtime...",
    "excerpt": "Learn Node.js basics",
    "categoryID": "64a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

#### Step 6: View Published Posts
```bash
curl -X GET http://localhost:5000/api/posts
```

---

## 💼 Common Use Cases

### Use Case 1: Blog Content Publishing

**Scenario**: Admin publishes an article

```bash
# 1. Login
accessToken=$(curl -s -X POST http://localhost:5000/api/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kraviona.com",
    "password": "AdminPass@123"
  }' | jq -r '.accessToken')

# 2. Create Post
curl -X POST http://localhost:5000/api/post/create \
  -H "Authorization: Bearer $accessToken" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced MongoDB Indexing",
    "slug": "advanced-mongodb-indexing",
    "content": "..."
  }'

# 3. View Published Post
curl -X GET http://localhost:5000/api/post/advanced-mongodb-indexing
```

### Use Case 2: Media Management

**Scenario**: Upload images for a blog post

```bash
# Upload multiple images
for image in images/*.jpg; do
  curl -X POST http://localhost:5000/api/upload \
    -H "Authorization: Bearer $accessToken" \
    -F "file=@$image"
done

# List all uploaded files
curl -X GET http://localhost:5000/api/files \
  -H "Authorization: Bearer $accessToken"
```

### Use Case 3: Contact Form Handling

**Scenario**: User submits contact form, admin reviews

```bash
# User sends message
curl -X POST http://localhost:5000/api/client/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Name",
    "email": "client@example.com",
    "subject": "Inquiry",
    "message": "I have a question..."
  }'

# Admin views messages
curl -X GET http://localhost:5000/api/admin/messages \
  -H "Authorization: Bearer $accessToken"
```

### Use Case 4: Email Newsletter

**Scenario**: Manage subscribers

```bash
# New subscriber
curl -X POST http://localhost:5000/api/subscriber/new \
  -H "Content-Type: application/json" \
  -d '{ "email": "subscriber@example.com" }'

# Admin views subscribers
curl -X GET http://localhost:5000/api/subscribers \
  -H "Authorization: Bearer $accessToken"
```

### Use Case 5: Content Categorization

**Scenario**: Organize blog posts by category

```bash
# Create category (admin only)
curl -X POST http://localhost:5000/api/category/new \
  -H "Authorization: Bearer $accessToken" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "slug": "web-development",
    "description": "Web dev tutorials"
  }'

# View public categories
curl -X GET http://localhost:5000/api/categories/public

# Get posts in category
curl -X GET http://localhost:5000/api/posts/category/web-development
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error information"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/username |
| 500 | Server Error | Internal server error |

---

## 🚀 Deployment

### Deploy to Heroku

1. **Install Heroku CLI** and login
2. **Create Heroku App**: `heroku create your-app-name`
3. **Set Environment Variables**: `heroku config:set VAR=value`
4. **Deploy**: `git push heroku main`

### Deploy to AWS EC2

1. Launch EC2 instance with Node.js
2. Upload code via SCP
3. Install dependencies and run with PM2
4. Setup Nginx as reverse proxy

### Deploy to DigitalOcean

1. Create Droplet with Ubuntu
2. Install Node.js and dependencies
3. Setup Nginx for reverse proxy
4. Configure SSL with Let's Encrypt

---

## 📞 Support & Contact

For issues or questions:
- Email: `support@kraviona.com`
- Documentation: This README.md

---

## 📄 License

This project is licensed under the ISC License.

---

**Last Updated**: May 2026
**Backend Version**: 1.0.0
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_verified_resend_email
   SUPPORT_EMAIL=support_team_email_address

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   node src/app.js
   ```

---

## API Endpoints Reference

Base URL: `http://localhost:<PORT>/api`

### 1. Authentication (`/api/auth`)

Handles user registration, verification, and logins.

| Method   | Endpoint               | Description                          | Body Parameters                                  | Auth Required |
| :------- | :--------------------- | :----------------------------------- | :----------------------------------------------- | :------------ |
| **POST** | `/auth/create-account` | Creates a new user and sends an OTP. | `email`, `name`, `username`, `phone`, `password` | No            |
| **POST** | `/auth/verify-account` | Verifies account using OTP.          | `identifier`, `otp`                              | No            |
| **POST** | `/auth/resend-otp`     | Resends the verification OTP.        | `identifier`                                     | No            |
| **POST** | `/auth/login-otp`      | Logs in a user using an OTP.         | `identifier`, `otp`                              | No            |
| **POST** | `/auth/login-password` | Logs in a user via password.         | `identifier`, `password`                         | No            |
| **PUT**  | `/auth/edit-account`   | Updates account details.             | `username`, `phone`, `avatar`, `bio`...          | Yes           |
| **POST** | `/auth/refresh-token`  | Refreshes access token.              | `token` (Refresh token)                          | No            |

_(Note: `identifier` can be the user's `email`, `username`, or `phone`)_

### 2. Media Management (`/api`)

Handles file uploads to Cloudinary. _Admin access is required for these routes._

| Method     | Endpoint     | Description                             | Query/Params       | Auth Required |
| :--------- | :----------- | :-------------------------------------- | :----------------- | :------------ |
| **POST**   | `/upload`    | Uploads a file (image, video, or doc).  | Form-Data: `file`  | Yes (Admin)   |
| **GET**    | `/files`     | Fetches all uploaded files (paginated). | `?page=1&limit=10` | Yes (Admin)   |
| **DELETE** | `/files/:id` | Deletes a file from DB & Cloudinary.    | `id` (Param)       | Yes (Admin)   |

### 3. Categories (`/api`)

Manages content categories.

| Method     | Endpoint                | Description                         | Body / Params                                    | Auth Required |
| :--------- | :---------------------- | :---------------------------------- | :----------------------------------------------- | :------------ |
| **POST**   | `/categories`           | Creates a new category.             | `name`, `description`, `image`, `status`         | Yes (Admin)   |
| **GET**    | `/categories/published` | Gets all published categories.      | `?page=1&limit=10`                               | No (Public)   |
| **GET**    | `/categories/:slug`     | Gets a specific category by slug.   | `slug` (Param)                                   | No (Public)   |
| **GET**    | `/categories/admin/all` | Gets all categories (incl. drafts). | `?page=1&limit=10`                               | Yes (Admin)   |
| **PUT**    | `/categories/:id`       | Updates an existing category.       | `name`, `description`, `image`, `status`, `slug` | Yes (Admin)   |
| **DELETE** | `/categories/:id`       | Deletes a category.                 | `id` (Param)                                     | Yes (Admin)   |

_(Note: Category endpoint paths above are implied based on standard REST conventions using your `categories.routes.js` context)_

### 4. Messages / Contact (`/api`)

Handles incoming support requests and administrative message management.

| Method     | Endpoint               | Description                         | Body / Params                                                   | Auth Required |
| :--------- | :--------------------- | :---------------------------------- | :-------------------------------------------------------------- | :------------ |
| **POST**   | `/messages/new`        | Submits a new contact form message. | `email`, `phone`, `subject`, `message`, `firstName`, `lastName` | No (Public)   |
| **GET**    | `/messages`            | Fetches all messages (paginated).   | `?page=1&limit=10`                                              | Yes (Admin)   |
| **PUT**    | `/messages/:id/status` | Updates read status.                | `isRead` (boolean)                                              | Yes (Admin)   |
| **PUT**    | `/messages/:id/read`   | Marks a message as read.            | `id` (Param)                                                    | Yes (Admin)   |
| **DELETE** | `/messages/:id`        | Deletes a message.                  | `id` (Param)                                                    | Yes (Admin)   |

### 5. Subscribers (`/api`)

Manages newsletter subscriptions.

| Method     | Endpoint           | Description                                    | Body / Params      | Auth Required |
| :--------- | :----------------- | :--------------------------------------------- | :----------------- | :------------ |
| **POST**   | `/subscribers/new` | Adds a new subscriber and sends welcome email. | `email`            | No (Public)   |
| **GET**    | `/subscribers`     | Fetches all subscribers.                       | `?page=1&limit=10` | Yes (Admin)   |
| **PUT**    | `/subscribers/:id` | Updates a subscriber's status.                 | `status`           | Yes (Admin)   |
| **DELETE** | `/subscribers/:id` | Deletes a subscriber.                          | `id` (Param)       | Yes (Admin)   |

---

## Error Handling

All endpoints respond with a standardized JSON structure for both success and error responses:

**Success Example:**

```json
{
  "message": "Action completed successfully",
  "success": true,
  "data": { ... }
}
```

**Error Example:**

```json
{
  "message": "Specific error message here",
  "success": false,
  "error": "Internal Server Error details (if applicable)"
}
```

## Folder Structure Overview

- `/src/app.js`: Main Express application configuration.
- `/src/routes/`: Contains all route definitions mapping to controllers.
- `/src/controllers/`: Contains the business logic for each route.
- `/src/models/`: Mongoose database schemas.
- `/src/middleware/`: Custom middlewares (e.g., `authMiddleWare`, Multer `fileUploader`).
- `/src/utils/`: Helper functions (Email senders, OTP generators, Token handling).

# 📋 API Reference Cheat Sheet

Quick reference for all API endpoints with request/response examples.

---

## 🔐 Authentication Endpoints

### POST /api/auth/create-account
**Create a new user account**

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "phone": "+91234567890",
  "password": "SecurePass@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created. OTP sent to email.",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### POST /api/auth/verify-account
**Verify account with OTP**

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### POST /api/auth/resend-otp
**Resend OTP to email**

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### POST /api/auth/login-otp
**Login using OTP**

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

---

### POST /api/auth/login-password
**Login using password**

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

---

## 📝 Post Endpoints

### POST /api/post/create
**Create a new post** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Understanding MongoDB",
  "slug": "understanding-mongodb",
  "content": "MongoDB is a NoSQL database...",
  "excerpt": "Learn the basics of MongoDB",
  "categoryID": "507f1f77bcf86cd799439011",
  "category": {
    "name": "Database",
    "slug": "database"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": { ... }
}
```

---

### GET /api/posts
**Get all published posts**

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `category` (optional) - Filter by category slug

**Response (200):**
```json
{
  "success": true,
  "posts": [ ... ],
  "total": 25,
  "page": 1
}
```

---

### GET /api/post/:slug
**Get post by slug**

**Example:** `GET /api/post/understanding-mongodb`

**Response (200):**
```json
{
  "success": true,
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Understanding MongoDB",
    "slug": "understanding-mongodb",
    "content": "...",
    "excerpt": "...",
    "views": 150,
    "reactions": {
      "like": 25,
      "dislike": 2,
      "share": 10
    },
    "author": { ... },
    "category": { ... },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /api/posts/category/:slug
**Get posts by category**

**Example:** `GET /api/posts/category/database`

**Response (200):**
```json
{
  "success": true,
  "posts": [ ... ],
  "total": 12
}
```

---

### DELETE /api/post/:slug
**Delete a post** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### PUT /api/keywords/:slug
**Update post keywords**

**Request:**
```json
{
  "keywords": ["mongodb", "database", "nosql", "tutorial"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Keywords updated"
}
```

---

## 📤 Media Upload Endpoints

### POST /api/upload
**Upload a file** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required) - Binary file (max 10MB)

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "media": {
    "_id": "507f1f77bcf86cd799439011",
    "url": "https://res.cloudinary.com/kraviona/image/upload/v123/xyz123.jpg",
    "publicId": "kraviona/xyz123",
    "fileName": "image.jpg",
    "fileSize": 102400,
    "fileType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /api/files
**Get all uploaded files** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "files": [ ... ],
  "total": 10
}
```

---

### DELETE /api/files/:id
**Delete a file** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### PUT /api/files/:id
**Update file alt text** ✅ *Requires Auth*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "altText": "MongoDB database diagram"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Alt text updated"
}
```

---

## 🏷️ Category Endpoints

### POST /api/category/new
**Create category** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "description": "All tech-related content",
  "image": "https://example.com/tech.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created",
  "category": { ... }
}
```

---

### GET /api/categories/public
**Get published categories**

**Response (200):**
```json
{
  "success": true,
  "categories": [ ... ],
  "total": 8
}
```

---

### GET /api/category/:slug
**Get category by slug**

**Example:** `GET /api/category/technology`

**Response (200):**
```json
{
  "success": true,
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Technology",
    "slug": "technology",
    "description": "All tech-related content",
    "image": "https://example.com/tech.jpg",
    "isPublished": true
  }
}
```

---

### GET /api/categories/admin
**Get all categories** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "categories": [ ... ],
  "total": 15
}
```

---

### PUT /api/category/:id
**Update category** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Technology & Innovation",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated"
}
```

---

### DELETE /api/category/:id
**Delete category** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

## 💬 Message Endpoints

### POST /api/client/send-message
**Send a message**

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91234567890",
  "subject": "Partnership Inquiry",
  "message": "I'm interested in collaborating..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

### GET /api/admin/messages
**Get all messages** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "messages": [ ... ],
  "total": 15
}
```

---

### GET /api/admin/messages/:id
**Get message details** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91234567890",
    "subject": "Partnership Inquiry",
    "message": "I'm interested in collaborating...",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### PATCH /api/admin/messages/:id
**Update message status** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "read"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### DELETE /api/admin/messages/:id
**Delete message** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted"
}
```

---

## 📧 Subscriber Endpoints

### POST /api/subscriber/new
**Subscribe to newsletter**

**Request:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

---

### GET /api/subscribers
**Get all subscribers** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "subscribers": [ ... ],
  "total": 250
}
```

---

### PUT /api/subscriber/update/:id
**Update subscriber status** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "unsubscribed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### DELETE /api/subscriber/delete/:id
**Delete subscriber** ✅ *Requires Auth (Admin)*

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscriber deleted"
}
```

---

## ⚠️ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid input data"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "details": "Error message"
}
```

---

## 🔑 Authorization Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9.signature
```

Replace `eyJhbGc...` with your actual access token from login response.

---

## 📊 Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate data |
| 500 | Server Error | Backend error |

---

**Last Updated**: May 2026
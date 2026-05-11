# 🚀 Quick Start Guide - Kraviona Backend

Get your backend running in 5 minutes!

---

## ⚡ Quick Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
```bash
# Copy and fill in your credentials
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@example.com
SUPPORT_EMAIL=support@example.com
FRONTEND_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
```

### 3. Start Server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server starts at: `http://localhost:5000`

---

## 🔑 Essential API Calls

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": "+91234567890",
    "password": "SecurePass@123"
  }'
```

### 2. Verify Email (Check your email for OTP)
```bash
curl -X POST http://localhost:5000/api/auth/verify-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```
**Response includes: `accessToken`** - Save this for protected requests!

### 4. Upload File
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/file.jpg"
```

### 5. Create Post
```bash
curl -X POST http://localhost:5000/api/post/create \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "Content here...",
    "excerpt": "Short excerpt",
    "categoryID": "category_id_here"
  }'
```

### 6. Get Published Posts
```bash
curl -X GET http://localhost:5000/api/posts
```

### 7. Send Message
```bash
curl -X POST http://localhost:5000/api/client/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Hello..."
  }'
```

### 8. Subscribe Newsletter
```bash
curl -X POST http://localhost:5000/api/subscriber/new \
  -H "Content-Type: application/json" \
  -d '{ "email": "subscriber@example.com" }'
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/create-account` | No | Sign up |
| POST | `/api/auth/verify-account` | No | Verify email |
| POST | `/api/auth/login-password` | No | Login |
| POST | `/api/post/create` | Yes | Create post |
| GET | `/api/posts` | No | Get all posts |
| GET | `/api/post/:slug` | No | Get post details |
| POST | `/api/upload` | Yes | Upload file |
| GET | `/api/files` | Yes | List files |
| DELETE | `/api/files/:id` | Yes | Delete file |
| POST | `/api/category/new` | Yes | Create category |
| GET | `/api/categories/public` | No | Get categories |
| POST | `/api/client/send-message` | No | Send message |
| GET | `/api/admin/messages` | Yes | Get messages |
| POST | `/api/subscriber/new` | No | Subscribe |

---

## 🔐 How to Use Access Token

After login, you'll receive an `accessToken`. Use it in all protected requests:

```bash
curl -X GET http://localhost:5000/api/files \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Token expires in **15 minutes**. Use the `refreshToken` to get a new one.

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Check MONGODB_URI in `.env`
- Ensure IP is whitelisted in MongoDB Atlas

### Email Not Sending
- Verify RESEND_API_KEY is valid
- Check email is verified in Resend dashboard

### 401 Unauthorized
- Token expired? Use refreshToken to get new one
- Token missing from Authorization header?

---

## 📚 Full Documentation

For complete API documentation, see [README.md](./README.md)

---

## 🎯 Next Steps

1. ✅ Complete installation
2. ✅ Test API endpoints with curl
3. ✅ Connect frontend to backend
4. ✅ Deploy to production

---

**Happy Coding! 🚀**
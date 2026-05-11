# 🔧 Environment Setup Guide

Complete guide for setting up environment variables for different deployment scenarios.

---

## 📝 Environment Variables Overview

The application requires the following environment variables to function properly:

### Categories

1. **Server Configuration** - Basic server settings
2. **Database Configuration** - MongoDB connection
3. **Authentication** - JWT security
4. **CORS** - Cross-origin resource sharing
5. **Cloudinary** - Media storage
6. **Email Services** - Email delivery
7. **Encryption** - Data encryption (optional)

---

## 🖥️ Local Development Environment

Use this configuration for local development on your machine.

### Create `.env` file:

```env
# ===== Server Configuration =====
PORT=5000
NODE_ENV=development

# ===== Database Configuration =====
MONGODB_URI=mongodb://localhost:27017/kraviona_dev
MONGODB_DB_NAME=kraviona_dev

# ===== Authentication =====
JWT_SECRET_KEY=dev_secret_key_min_32_chars_1234567890

# ===== CORS Configuration =====
FRONTEND_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
BACKENDAPI_CORS=http://localhost:5000

# ===== Cloudinary (Media Storage) =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===== Email Services (Resend) =====
RESEND_API_KEY=re_test_key_or_your_api_key
RESEND_FROM_EMAIL=noreply@localhost
SUPPORT_EMAIL=support@localhost
```

### Start Development Server:
```bash
npm run dev
```

---

## ☁️ Production Environment

Production-ready configuration for deployed applications.

### Create `.env.production` file:

```env
# ===== Server Configuration =====
PORT=5000
NODE_ENV=production

# ===== Database Configuration =====
# Use MongoDB Atlas for production
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/kraviona?retryWrites=true&w=majority
MONGODB_DB_NAME=kraviona_prod

# ===== Authentication =====
# Generate a strong random key (minimum 32 characters)
JWT_SECRET_KEY=your_production_jwt_secret_key_minimum_32_characters_long_random_string

# ===== CORS Configuration =====
# Set specific domains instead of localhost
FRONTEND_CORS=https://www.kraviona.com
ADMIN_CORS=https://admin.kraviona.com
BACKENDAPI_CORS=https://api.kraviona.com

# ===== Cloudinary (Media Storage) =====
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# ===== Email Services (Resend) =====
# Use your verified production API key
RESEND_API_KEY=re_your_production_api_key
RESEND_FROM_EMAIL=noreply@kraviona.com
SUPPORT_EMAIL=support@kraviona.com
```

### Deploy:
```bash
npm start
```

---

## 🧪 Testing Environment

Configuration for running automated tests.

### Create `.env.test` file:

```env
# ===== Server Configuration =====
PORT=5001
NODE_ENV=test

# ===== Database Configuration =====
# Use a test database or MongoDB memory server
MONGODB_URI=mongodb://localhost:27017/kraviona_test
MONGODB_DB_NAME=kraviona_test

# ===== Authentication =====
JWT_SECRET_KEY=test_secret_key_1234567890123456

# ===== CORS Configuration =====
FRONTEND_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
BACKENDAPI_CORS=http://localhost:5001

# ===== Cloudinary (Media Storage) =====
CLOUDINARY_CLOUD_NAME=test_cloud
CLOUDINARY_API_KEY=test_key
CLOUDINARY_API_SECRET=test_secret

# ===== Email Services (Resend) =====
RESEND_API_KEY=re_test_key
RESEND_FROM_EMAIL=test@example.com
SUPPORT_EMAIL=test@example.com
```

### Run Tests:
```bash
npm test
```

---

## 🚀 Cloud Deployment Environments

### Heroku Deployment

Set environment variables directly on Heroku:

```bash
# Login to Heroku
heroku login

# Set variables for your app
heroku config:set PORT=5000 -a your-app-name
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set MONGODB_URI=mongodb+srv://... -a your-app-name
heroku config:set JWT_SECRET_KEY=your_secret -a your-app-name
heroku config:set CLOUDINARY_CLOUD_NAME=... -a your-app-name
heroku config:set CLOUDINARY_API_KEY=... -a your-app-name
heroku config:set CLOUDINARY_API_SECRET=... -a your-app-name
heroku config:set RESEND_API_KEY=... -a your-app-name
heroku config:set RESEND_FROM_EMAIL=... -a your-app-name
heroku config:set SUPPORT_EMAIL=... -a your-app-name
heroku config:set FRONTEND_CORS=https://yourdomain.com -a your-app-name
heroku config:set ADMIN_CORS=https://admin.yourdomain.com -a your-app-name
heroku config:set BACKENDAPI_CORS=https://api.yourdomain.com -a your-app-name
```

### AWS EC2 Deployment

Create `.env` file on EC2 instance:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Create .env file
nano /app/.env
```

Paste the production configuration.

### DigitalOcean App Platform

1. Go to App Platform in DigitalOcean dashboard
2. Create new app
3. In Settings, set environment variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET_KEY=...
[etc...]
```

---

## 📋 Variable Reference Guide

### 1. PORT
- **Description**: Server port number
- **Development**: `5000`
- **Production**: `5000` or `8080`
- **Required**: Yes

### 2. NODE_ENV
- **Description**: Environment type
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Required**: No

### 3. MONGODB_URI
- **Description**: MongoDB connection string
- **Development**: `mongodb://localhost:27017/kraviona_dev`
- **Production**: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- **Required**: Yes
- **Get from**: MongoDB Atlas dashboard

### 4. MONGODB_DB_NAME
- **Description**: Database name
- **Development**: `kraviona_dev`
- **Production**: `kraviona_prod`
- **Required**: Yes

### 5. JWT_SECRET_KEY
- **Description**: Secret key for JWT token signing
- **Requirement**: Minimum 32 characters, random, unique
- **Required**: Yes
- **Generate**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 6. FRONTEND_CORS
- **Description**: Frontend URL for CORS
- **Development**: `http://localhost:3000`
- **Production**: `https://www.kraviona.com`
- **Required**: Yes

### 7. ADMIN_CORS
- **Description**: Admin dashboard URL for CORS
- **Development**: `http://localhost:3001`
- **Production**: `https://admin.kraviona.com`
- **Required**: Yes

### 8. BACKENDAPI_CORS
- **Description**: Backend API URL for CORS
- **Development**: `http://localhost:5000`
- **Production**: `https://api.kraviona.com`
- **Required**: Yes

### 9. CLOUDINARY_CLOUD_NAME
- **Description**: Your Cloudinary account cloud name
- **Required**: Yes
- **Get from**: Cloudinary dashboard > Settings > General

### 10. CLOUDINARY_API_KEY
- **Description**: Cloudinary API key
- **Required**: Yes
- **Get from**: Cloudinary dashboard > Settings > API Keys

### 11. CLOUDINARY_API_SECRET
- **Description**: Cloudinary API secret (keep confidential!)
- **Required**: Yes
- **Get from**: Cloudinary dashboard > Settings > API Keys

### 12. RESEND_API_KEY
- **Description**: Resend email service API key
- **Required**: Yes
- **Get from**: Resend dashboard > API Keys
- **Note**: Create a new API key for production

### 13. RESEND_FROM_EMAIL
- **Description**: Email address for sending emails
- **Format**: `noreply@yourdomain.com`
- **Required**: Yes
- **Note**: Must be verified in Resend

### 14. SUPPORT_EMAIL
- **Description**: Support email address
- **Format**: `support@yourdomain.com`
- **Required**: Yes

---

## 🔑 How to Generate Secure Keys

### JWT_SECRET_KEY
```bash
# Generate random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Using OpenSSL
```bash
# Generate random string
openssl rand -hex 32

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## ✅ Verification Checklist

Before deploying, verify all environment variables:

- [ ] PORT is set and accessible
- [ ] MONGODB_URI connects to correct database
- [ ] JWT_SECRET_KEY is minimum 32 characters
- [ ] CORS URLs are correct for the environment
- [ ] Cloudinary credentials are valid
- [ ] Resend API key is active
- [ ] Email addresses are verified in Resend
- [ ] All required variables are present
- [ ] No sensitive data in version control
- [ ] .env file is in .gitignore

---

## 🚨 Security Best Practices

1. **Never commit `.env` to version control**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".env.*" >> .gitignore
   ```

2. **Use different keys for each environment**
   - Development, staging, and production keys should be different

3. **Rotate JWT_SECRET_KEY periodically**
   - Every 3-6 months in production

4. **Never share API keys**
   - Keep Cloudinary and Resend keys private

5. **Use strong random strings**
   - Minimum 32 characters for sensitive keys

6. **Validate all environment variables on startup**
   ```javascript
   // The config.js file already does this!
   // It will throw error if any required variable is missing
   ```

---

## 🔄 Environment Variable Rotation

### When to rotate:
- Employee departure
- Suspected compromise
- Regular security schedule (quarterly)

### How to rotate:
1. Generate new keys
2. Update in provider (MongoDB, Cloudinary, etc.)
3. Update .env file
4. Restart application
5. Monitor for issues

---

## 📞 Troubleshooting

### "Missing environment variable: MONGODB_URI"
- Check .env file exists in root directory
- Verify MONGODB_URI is set correctly
- Ensure MongoDB cluster is accessible

### "Unauthorized: Invalid token"
- JWT_SECRET_KEY might be different than when token was created
- Check JWT_SECRET_KEY is consistent across deployments

### "CORS error"
- Check FRONTEND_CORS matches frontend URL exactly
- Include http:// or https:// in CORS URLs
- Production must use https://

### "Cloudinary upload failed"
- Verify CLOUDINARY_CLOUD_NAME is correct
- Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
- Ensure Cloudinary account is active

### "Email not sending"
- Verify RESEND_API_KEY is valid
- Check email is verified in Resend dashboard
- Ensure RESEND_FROM_EMAIL is correct

---

## 📚 Related Documentation

- [README.md](./README.md) - Full documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [API_CHEATSHEET.md](./API_CHEATSHEET.md) - API reference

---

**Last Updated**: May 2026
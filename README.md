# Crossover Fintech Support - Backend API

This is the Express.js backend for the **Crossover Fintech Support** platform. It handles user authentication (OTP & Password), role-based access control, media uploading via Cloudinary, mailing via Resend, as well as managing categories, messages, and subscribers.

## Features

- **Authentication & Authorization**: Secure account creation with OTP verification, JWT-based authentication, and Admin/User role management.
- **Media Management**: Cloudinary integration for uploading, fetching, and deleting images, videos, and documents.
- **Email Notifications**: Integrated with **Resend** to send Welcome emails, OTPs, Login alerts, and Support auto-replies.
- **Categories**: Full CRUD for content categories, including draft/publish statuses and slug auto-generation.
- **Messages/Support**: Public contact form submission handling and an admin portal to read, update, and delete messages.
- **Subscribers**: Newsletter subscription management for tracking and communicating with subscribers.

---

## Prerequisites

Before you begin, ensure you have the following installed and set up:

- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary Account (for media uploads)
- Resend Account (for email delivery)

---

## Installation & Setup

1. **Clone the repository and navigate to the backend folder:**

   ```bash
   git clone <repository_url>
   cd cross_back
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key

   # Resend Email Configuration
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

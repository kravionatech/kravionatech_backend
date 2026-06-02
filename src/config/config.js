import dotenv from "dotenv";

dotenv.config();

/**
 * Centralised config.
 * - Hard-required vars (no default) — server throws on boot if missing.
 * - Soft vars (CORS origins) — fall back to localhost so dev never crashes.
 * - The list of required keys is short on purpose: anything else is optional.
 */
const REQUIRED = ["JWT_SECRET_KEY", "MONGODB_URI", "MONGODB_DB_NAME", "PORT"];

const config = {
  // Hard-required
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  PORT: process.env.PORT,

  // Soft / optional with safe defaults
  FRONTEND_CORS: process.env.FRONTEND_CORS || "http://localhost:3000",
  ADMIN_CORS: process.env.ADMIN_CORS || "http://localhost:3001",
  BACKENDAPI_CORS: process.env.BACKENDAPI_CORS || "http://localhost:5000",
  CORS: [process.env.FRONTEND_CORS, process.env.ADMIN_CORS].filter(Boolean),

  // Cloudinary (only required when an upload route is hit)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@kraviona.com",
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@kraviona.com",
};

for (const key of REQUIRED) {
  if (!config[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export default config;

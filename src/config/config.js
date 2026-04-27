import dotenv from "dotenv";

dotenv.config();

const config = {
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  CORS: [process.env.FRONTEND_CORS, process.env.ADMIN_CORS],
  BACKENDAPI_CORS: process.env.BACKENDAPI_CORS,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
};

for (const [key, value] of Object.entries(config)) {
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
}

export default config;

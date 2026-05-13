import dotenv from "dotenv";
dotenv.config();

import { app } from "./src/app.js";
import { databaseConnection } from "./src/config/db.js";
import { cloudinaryConfig } from "./src/config/cloudinary.js";
import { seedSettings } from "./src/utils/seedSettings.js";
import { startCronJobs } from "./src/jobs/cleanup.js";

// Connect DB → seed → start server
databaseConnection().then(async () => {
  // Seed default site settings (safe — uses $setOnInsert, never overwrites)
  await seedSettings();

  // Start background cron jobs
  startCronJobs();
});

cloudinaryConfig();

// Server
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on Port: ${process.env.PORT}\nhttp://localhost:${process.env.PORT}`,
  );
});

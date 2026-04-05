import dotenv from "dotenv";
dotenv.config();
import { app } from "./src/app.js";
import { databaseConnection } from "./src/config/db.js";
import cors from "cors";
import { cloudinaryConfig } from "./src/config/cloudinary.js";

databaseConnection();
cloudinaryConfig();

// server connection
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on Port: ${process.env.PORT}\nhttp://localhost:${process.env.PORT}`,
  );
});

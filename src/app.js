import express from "express";
import { userRouter } from "./routes/user.routes.js";
import { messageRouter } from "./routes/messages.routes.js";
import { subscriberRouter } from "./routes/subscriber.routes.js";
import { fileRouter } from "./routes/media.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import cors from "cors";
import { postRouter } from "./routes/post.routes.js";

export const app = express();
app.set("trust proxy", true);

// CORS Configuration with environment variables for security
const allowedOrigins = [
  process.env.FRONTEND_CORS || "http://localhost:3000",
  process.env.ADMIN_CORS || "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", userRouter);

// message router
app.use("/api", messageRouter);

// subscriber router

app.use("/api", subscriberRouter);

app.use("/api", fileRouter);

// category router

app.use("/api", categoriesRouter);

// post
app.use("/api", postRouter);

// Default route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    success: false,
  });
});

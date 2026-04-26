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
app.use(
  cors({
    origin: "*", // You can lock this down to "http://localhost:3000" later
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

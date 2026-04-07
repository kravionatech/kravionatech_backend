import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  categoryByPost,
  createNewPost,
  publishedDetailsPost,
  publishedPost,
} from "../controllers/post.controller.js";
export const postRouter = express.Router();

postRouter.post("/post/create", authMiddleWare, createNewPost);
postRouter.get("/posts", publishedPost);
postRouter.get("/post/:slug", publishedDetailsPost);

postRouter.get("/posts/category/:slug", categoryByPost);

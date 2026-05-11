import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  categoryByPost,
  createNewPost,
  deletePost,
  editPost,
  PostReaction,
  publishedDetailsPost,
  publishedPost,
  updateKeyword,
} from "../controllers/post.controller.js";
export const postRouter = express.Router();

postRouter.post("/post/create", authMiddleWare, createNewPost);
postRouter.get("/posts", publishedPost);
postRouter.get("/post/:slug", publishedDetailsPost);

postRouter.get("/posts/category/:slug", categoryByPost);
postRouter.delete("/post/:slug", authMiddleWare, deletePost);
postRouter.put("/post/:slug", authMiddleWare, editPost);
postRouter.put("/keywords/:slug", authMiddleWare, updateKeyword);
postRouter.put("/post/reaction/:slug", PostReaction);

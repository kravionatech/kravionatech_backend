import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
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

postRouter.post("/post/create", authMiddleWare, roleCheck("super_admin"), createNewPost);
postRouter.get("/posts", publishedPost);
postRouter.get("/post/:slug", publishedDetailsPost);

postRouter.get("/posts/category/:slug", categoryByPost);
postRouter.delete("/post/:slug", authMiddleWare, roleCheck("super_admin"), deletePost);
postRouter.put("/post/:slug", authMiddleWare, roleCheck("super_admin"), editPost);
postRouter.put("/keywords/:slug", authMiddleWare, roleCheck("super_admin"), updateKeyword);
postRouter.put("/post/reaction/:slug", PostReaction);

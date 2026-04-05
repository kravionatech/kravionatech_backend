import express from "express";
import {
    deleteMessage,
  getAllMessages,
  newMessage,
  readMessage,
  updateMessageStatus,
} from "../controllers/messages.controller.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";

export const messageRouter = express.Router();

messageRouter.post("/client/send-message", newMessage);

messageRouter.get("/admin/messages", authMiddleWare, getAllMessages);

messageRouter.patch("/admin/messages/:id", authMiddleWare, updateMessageStatus);

messageRouter.get("/admin/messages/:id", authMiddleWare, readMessage);

messageRouter.delete("/admin/messages/:id", authMiddleWare, deleteMessage);

import express from "express";
import {
    deleteMessage,
  getAllMessages,
  newMessage,
  readMessage,
  updateMessageStatus,
} from "../controllers/messages.controller.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";

export const messageRouter = express.Router();

messageRouter.post("/client/send-message", newMessage);

messageRouter.get("/admin/messages", authMiddleWare, roleCheck("super_admin"), getAllMessages);

messageRouter.patch("/admin/messages/:id", authMiddleWare, roleCheck("super_admin"), updateMessageStatus);

messageRouter.get("/admin/messages/:id", authMiddleWare, roleCheck("super_admin"), readMessage);

messageRouter.delete("/admin/messages/:id", authMiddleWare, roleCheck("super_admin"), deleteMessage);

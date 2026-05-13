import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

export const notificationRouter = express.Router();

notificationRouter.get("/admin/notifications", authMiddleWare, getNotifications);
notificationRouter.patch("/admin/notifications/read-all", authMiddleWare, markAllRead);
notificationRouter.patch("/admin/notifications/:id/read", authMiddleWare, markOneRead);
notificationRouter.delete("/admin/notifications/:id", authMiddleWare, deleteNotification);

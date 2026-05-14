import express from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

export const notificationRouter = express.Router();

notificationRouter.get("/admin/notifications", authMiddleWare, roleCheck("super_admin"), getNotifications);
notificationRouter.patch("/admin/notifications/read-all", authMiddleWare, roleCheck("super_admin"), markAllRead);
notificationRouter.patch("/admin/notifications/:id/read", authMiddleWare, roleCheck("super_admin"), markOneRead);
notificationRouter.delete("/admin/notifications/:id", authMiddleWare, roleCheck("super_admin"), deleteNotification);

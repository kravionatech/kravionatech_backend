import express from "express";
import {
  deleteSubscriber,
  getAllSubscriber,
  newSubscriber,
  updateSubscriberStatus,
} from "../controllers/subcriber.controller.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";

export const subscriberRouter = express.Router();

// @route POST /api/subscriber/new
subscriberRouter.post("/subscriber/new", newSubscriber);

// @route GET /api/subscribers
subscriberRouter.get("/subscribers", authMiddleWare, roleCheck("super_admin"), getAllSubscriber);

// @route PUT /api/subscriber/update/:id
subscriberRouter.put(
  "/subscriber/update/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  updateSubscriberStatus,
);

// @route DELETE /api/subscriber/delete/:id
subscriberRouter.delete(
  "/subscriber/delete/:id",
  authMiddleWare,
  roleCheck("super_admin"),
  deleteSubscriber,
);

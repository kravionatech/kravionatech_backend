import express from "express";
import {
  deleteSubscriber,
  getAllSubscriber,
  newSubscriber,
  updateSubscriberStatus,
} from "../controllers/subcriber.controller.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";

export const subscriberRouter = express.Router();

// @route POST /api/subscriber/new
subscriberRouter.post("/subscriber/new", newSubscriber);

// @route GET /api/subscribers
subscriberRouter.get("/subscribers", authMiddleWare, getAllSubscriber);

// @route PUT /api/subscriber/update/:id
subscriberRouter.put(
  "/subscriber/update/:id",
  authMiddleWare,
  updateSubscriberStatus,
);

// @route DELETE /api/subscriber/delete/:id
subscriberRouter.delete(
  "/subscriber/delete/:id",
  authMiddleWare,
  deleteSubscriber,
);

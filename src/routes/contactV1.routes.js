/**
 * Public contact + newsletter routes — dynamization spec §8 & §9
 */
import express from "express";
import { submitContact } from "../controllers/contactV1.controller.js";
import { subscribeNewsletter } from "../controllers/newsletterV1.controller.js";

export const contactV1Router = express.Router();

// POST /api/v1/public/contact — public, rate-limited
contactV1Router.post("/v1/public/contact", submitContact);

// POST /api/v1/public/newsletter/subscribe
contactV1Router.post("/v1/public/newsletter/subscribe", subscribeNewsletter);

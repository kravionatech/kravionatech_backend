import express from "express";
import {
  accountCodeVerification,
  createAccount,
  logInWithOTP,
  logInWithPassword,
  resendOTP,
} from "../controllers/user.controller.js";
export const userRouter = express.Router();

userRouter.post("/auth/create-account", createAccount);

userRouter.post("/auth/verify-account", accountCodeVerification);

userRouter.post("/auth/resend-otp", resendOTP);

userRouter.post("/auth/login-otp", logInWithOTP);
userRouter.post("/auth/login-password", logInWithPassword);

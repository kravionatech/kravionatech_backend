import express from "express";
import {
  accountCodeVerification,
  createAccount,
  editAccount,
  logInWithOTP,
  logInWithPassword,
  refreshToken,
  resendOTP,
  logout,
} from "../controllers/user.controller.js";

import { authMiddleWare } from "../middleware/authMiddleWare.js";

export const userRouter = express.Router();

userRouter.post("/auth/create-account", createAccount);

userRouter.post("/auth/verify-account", accountCodeVerification);

userRouter.post("/auth/resend-otp", resendOTP);

userRouter.post("/auth/login-otp", logInWithOTP);
userRouter.post("/auth/login-password", logInWithPassword);

userRouter.put("/auth/edit-account", authMiddleWare, editAccount);
userRouter.post("/auth/refresh-token", refreshToken);
userRouter.post("/auth/logout", authMiddleWare, logout);


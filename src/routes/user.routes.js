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
  getAllUsers,
  updateUserRole,
  deleteUser,
  toggleUserBlock,
} from "../controllers/user.controller.js";

import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";

export const userRouter = express.Router();

userRouter.post("/auth/create-account", createAccount);

userRouter.post("/auth/verify-account", accountCodeVerification);

userRouter.post("/auth/resend-otp", resendOTP);

userRouter.post("/auth/login-otp", logInWithOTP);
userRouter.post("/auth/login-password", logInWithPassword);

userRouter.put("/auth/edit-account", authMiddleWare, editAccount);
userRouter.post("/auth/refresh-token", refreshToken);
userRouter.post("/auth/logout", authMiddleWare, logout);

// Admin User Management
userRouter.get("/admin/users", authMiddleWare, roleCheck("super_admin"), getAllUsers);
userRouter.patch("/admin/user/role", authMiddleWare, roleCheck("super_admin"), updateUserRole);
userRouter.patch("/admin/user/:id/block", authMiddleWare, roleCheck("super_admin"), toggleUserBlock);
userRouter.delete("/admin/user/:id", authMiddleWare, roleCheck("super_admin"), deleteUser);


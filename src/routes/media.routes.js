import express from "express";
import { upload } from "../middleware/fileUploader.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  changeAlt,
  deleteFile,
  getAllFiles,
  uploadFile,
} from "../controllers/media.controller.js";

export const fileRouter = express.Router();

// Authenticate FIRST, then check role, then process the file upload
fileRouter.post("/upload", authMiddleWare, roleCheck("super_admin"), upload.single("file"), uploadFile);

fileRouter.get("/files", authMiddleWare, roleCheck("super_admin"), getAllFiles);
fileRouter.delete("/files/:id", authMiddleWare, roleCheck("super_admin"), deleteFile);
fileRouter.put("/files/:id", authMiddleWare, roleCheck("super_admin"), changeAlt);

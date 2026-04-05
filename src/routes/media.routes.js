import express from "express";
import { upload } from "../middleware/fileUploader.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  changeAlt,
  deleteFile,
  getAllFiles,
  uploadFile,
} from "../controllers/media.controller.js";

export const fileRouter = express.Router();

// Authenticate FIRST, then process the file upload
fileRouter.post("/upload", authMiddleWare, upload.single("file"), uploadFile);

fileRouter.get("/files", authMiddleWare, getAllFiles);
fileRouter.delete("/files/:id", authMiddleWare, deleteFile);
fileRouter.put("/files/:id", authMiddleWare, changeAlt);

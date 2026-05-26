import { Router } from "express";
import { uploadMiddleware, uploadAudio } from "../controllers/upload.controller.js";

export const uploadRouter = Router();

// POST /api/upload — receives multipart/form-data audio file
uploadRouter.post("/", uploadMiddleware, uploadAudio);

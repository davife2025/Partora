import { Router } from "express";
import {
  voiceUploadMiddleware,
  voiceChange,
  generateSung,
  getSingStatus,
} from "../controllers/sing.controller.js";

export const singRouter = Router();

// POST /api/sing/voice-change  — transform user's humming to SATB voice
singRouter.post("/voice-change", voiceUploadMiddleware, voiceChange);

// POST /api/sing/generate/:resultId — generate pitched singing for SATB result
singRouter.post("/generate/:resultId", generateSung);

// GET  /api/sing/status/:jobId — poll singing generation job
singRouter.get("/status/:jobId", getSingStatus);

import { Router } from "express";
import * as analysisController from "../controllers/analysis.controller.js";

export const analysisRouter = Router();

// Mode 1 — Lyrics
analysisRouter.post("/lyrics",         analysisController.analyseLyrics);

// Job polling
analysisRouter.get("/job/:id",         analysisController.getJobStatus);

// Results
analysisRouter.get("/song/:songId",    analysisController.getResultBySong);
analysisRouter.get("/:id",             analysisController.getResult);

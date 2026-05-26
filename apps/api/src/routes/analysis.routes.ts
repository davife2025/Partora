import { Router } from "express";

export const analysisRouter = Router();

// POST /api/analysis/lyrics  → Mode 1
analysisRouter.post("/lyrics", (_req, res) => {
  res.json({ success: true, message: "Lyrics analysis — implemented in Session 4" });
});

// GET /api/analysis/job/:id  → poll job status
analysisRouter.get("/job/:id", (_req, res) => {
  res.json({ success: true, message: "Job status — implemented in Session 4" });
});

// GET /api/analysis/:id      → get saved result
analysisRouter.get("/:id", (_req, res) => {
  res.json({ success: true, message: "Get result — implemented in Session 4" });
});

import { Router } from "express";

export const recordRouter = Router();
recordRouter.post("/", (_req, res) => {
  res.json({ success: true, message: "Live recording analysis — implemented in Session 7" });
});

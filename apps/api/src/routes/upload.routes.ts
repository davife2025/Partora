import { Router } from "express";

export const uploadRouter = Router();
uploadRouter.post("/", (_req, res) => {
  res.json({ success: true, message: "Audio upload — implemented in Session 5" });
});

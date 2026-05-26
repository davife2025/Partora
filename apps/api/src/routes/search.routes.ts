import { Router } from "express";

export const searchRouter = Router();
searchRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "Song search — implemented in Session 6" });
});
searchRouter.post("/recognise", (_req, res) => {
  res.json({ success: true, message: "Song recognition — implemented in Session 6" });
});

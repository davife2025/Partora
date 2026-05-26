import { Router } from "express";

export const userRouter = Router();
userRouter.get("/profile", (_req, res) => {
  res.json({ success: true, message: "User profile — implemented in Session 2" });
});
userRouter.get("/history", (_req, res) => {
  res.json({ success: true, message: "Song history — implemented in Session 10" });
});

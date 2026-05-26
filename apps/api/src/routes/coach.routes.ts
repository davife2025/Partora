import { Router } from "express";

export const coachRouter = Router();
coachRouter.get("/ws-token", (_req, res) => {
  res.json({ success: true, message: "Voice coach WebSocket token — implemented in Session 8" });
});

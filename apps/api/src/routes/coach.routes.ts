import { Router } from "express";
import { getWsToken } from "../controllers/coach.controller.js";

export const coachRouter = Router();

// Issue a one-time WebSocket connection token
coachRouter.get("/ws-token", getWsToken);

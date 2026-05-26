import { Router } from "express";
import { submitRecording } from "../controllers/record.controller.js";

export const recordRouter = Router();

recordRouter.post("/", submitRecording);

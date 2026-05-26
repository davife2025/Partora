import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

export const userRouter = Router();

// Profile
userRouter.get("/profile",               userController.getProfile);
userRouter.patch("/profile",             userController.updateProfile);

// History
userRouter.get("/history",               userController.getHistory);
userRouter.delete("/songs/:id",          userController.deleteSong);

// Library
userRouter.get("/library",               userController.getLibrary);
userRouter.post("/library",              userController.saveToLibrary);
userRouter.delete("/library/:song_id",   userController.removeFromLibrary);

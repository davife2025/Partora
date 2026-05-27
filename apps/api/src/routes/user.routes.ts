import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/profile",              userController.getProfile);
userRouter.patch("/profile",            userController.updateProfile);
userRouter.get("/stats",                userController.getStats);
userRouter.get("/history",              userController.getHistory);
userRouter.delete("/songs/:id",         userController.deleteSong);
userRouter.post("/songs/:id/delete",    userController.deleteSong);
userRouter.get("/library",              userController.getLibrary);
userRouter.post("/library",             userController.saveToLibrary);
userRouter.delete("/library/:song_id",  userController.removeFromLibrary);

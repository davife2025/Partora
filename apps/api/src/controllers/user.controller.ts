import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import * as userService from "../services/user.service.js";
import { AppError } from "../middleware/error.middleware.js";

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getProfile(req.userId!);
    res.json({ success: true, data: profile });
  } catch (e) { next(e); }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { full_name, preferred_voice_part, avatar_url } = req.body as Record<string, string>;
    const profile = await userService.updateProfile(req.userId!, { full_name, preferred_voice_part: preferred_voice_part as never, avatar_url });
    res.json({ success: true, data: profile });
  } catch (e) { next(e); }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const limit  = parseInt((req.query.limit  as string) ?? "20", 10);
    const offset = parseInt((req.query.offset as string) ?? "0", 10);
    const history = await userService.getSongHistory(req.userId!, limit, offset);
    res.json({ success: true, data: history });
  } catch (e) { next(e); }
}

export async function getLibrary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const library = await userService.getLibrary(req.userId!);
    res.json({ success: true, data: library });
  } catch (e) { next(e); }
}

export async function saveToLibrary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { song_id } = req.body as { song_id: string };
    if (!song_id) throw new AppError("song_id is required", 400);
    const result = await userService.saveToLibrary(req.userId!, song_id);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function removeFromLibrary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { song_id } = req.params;
    const result = await userService.removeFromLibrary(req.userId!, song_id);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function deleteSong(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await userService.deleteSong(req.userId!, id);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

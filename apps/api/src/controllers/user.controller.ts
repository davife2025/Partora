import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest }   from "../middleware/auth.middleware.js";
import { supabaseAdmin }               from "../config/supabase.js";
import * as userService                from "../services/user.service.js";
import { AppError }                    from "../middleware/error.middleware.js";

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await userService.getProfile(req.userId!);
    res.json({ success: true, data: profile });
  } catch (e) { next(e); }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { full_name, preferred_voice_part, avatar_url } = req.body as Record<string, string>;
    const profile = await userService.updateProfile(req.userId!, {
      full_name,
      preferred_voice_part: preferred_voice_part as never,
      avatar_url,
    });
    res.json({ success: true, data: profile });
  } catch (e) { next(e); }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const limit  = Math.min(parseInt((req.query.limit  as string) ?? "20", 10), 50);
    const offset = parseInt((req.query.offset as string) ?? "0", 10);

    // Use the SQL helper function for efficient joined query
    const { data, error } = await supabaseAdmin
      .rpc("get_my_history", { lim: limit, off: offset });

    if (error) throw new AppError("Failed to fetch history", 500);
    res.json({ success: true, data: data ?? [] });
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
const { id } = req.params;
const songId = Array.isArray(id) ? id[0] : id;
if (!songId) throw new Error("Missing song id");
const result = await userService.deleteSong(req.userId!, songId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function deleteSong(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Delete audio files from storage first
    const { data: satb } = await supabaseAdmin
      .from("satb_results")
      .select("song_id")
      .eq("song_id", id)
      .eq("user_id", req.userId!)
      .single();

    if (satb) {
      const parts = ["soprano", "alto", "tenor", "bass"];
      const paths = [
        ...parts.map((p) => `${req.userId!}/${id}/${p}-solfa.mp3`),
        ...parts.map((p) => `${req.userId!}/${id}/${p}-sung.mp3`),
        ...parts.map((p) => `${req.userId!}/${id}/${p}-backing.mp3`),
      ];
      await supabaseAdmin.storage.from("audio-outputs").remove(paths);
    }

  const songId = Array.isArray(id) ? id[0] : id;
const result = await userService.deleteSong(req.userId!, songId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { data: songs } = await supabaseAdmin
      .from("songs")
      .select("source, key, mode")
      .eq("user_id", req.userId!);

    if (!songs) { res.json({ success: true, data: {} }); return; }

    const bySource: Record<string, number> = {};
    const byKey:    Record<string, number> = {};

    songs.forEach((s) => {
      bySource[s.source] = (bySource[s.source] ?? 0) + 1;
      const k = `${s.key} ${s.mode}`;
      byKey[k] = (byKey[k] ?? 0) + 1;
    });

    // Most common key
    const topKey = Object.entries(byKey).sort((a, b) => b[1] - a[1])[0]?.[0];

    res.json({
      success: true,
      data: {
        total:     songs.length,
        by_source: bySource,
        by_key:    byKey,
        top_key:   topKey,
      },
    });
  } catch (e) { next(e); }
}

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin }              from "../config/supabase.js";
import { analysisQueue }              from "../services/queue.service.js";
import { searchSongs }                from "../services/audd.service.js";
import { AppError }                   from "../middleware/error.middleware.js";

// ─── GET /api/search?q=… ──────────────────────────────────────────
export async function search(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q || q.length < 2) {
      throw new AppError("Query must be at least 2 characters", 400);
    }

    const results = await searchSongs(q, 10);
    res.json({ success: true, data: { results } });
  } catch (e) { next(e); }
}

// ─── POST /api/search/analyse ─────────────────────────────────────
// Kick off SATB analysis for a song found via search
const AnalyseSearchSchema = z.object({
  title:      z.string().min(1).max(300),
  artist:     z.string().min(1).max(300),
  artwork_url: z.string().url().optional(),
  duration:   z.number().optional(),
  preview_url: z.string().url().optional(),
  spotify_url: z.string().url().optional(),
  song_link:  z.string().url().optional(),
  lyrics:     z.string().max(5000).optional(),
});

export async function analyseSong(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = AnalyseSearchSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const jobId = uuidv4();

    await supabaseAdmin.from("analysis_jobs").insert({
      id:         jobId,
      user_id:    req.userId!,
      status:     "pending",
      input_mode: "search",
      progress:   0,
      step:       "Queued…",
    });

    await analysisQueue.add(
      {
        type:   "search",
        jobId,
        userId: req.userId!,
        input:  parsed.data,
      },
      { jobId }
    );

    res.status(202).json({
      success: true,
      data: { job_id: jobId, status: "pending" },
    });
  } catch (e) { next(e); }
}

// ─── GET /api/search/recent ───────────────────────────────────────
// Returns the user's 5 most recent search-mode analyses (for quick re-access)
export async function recentSearches(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { data } = await supabaseAdmin
      .from("songs")
      .select("id, title, artist, key, mode, artwork_url, created_at")
      .eq("user_id", req.userId!)
      .eq("source", "search")
      .order("created_at", { ascending: false })
      .limit(5);

    res.json({ success: true, data: data ?? [] });
  } catch (e) { next(e); }
}

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin } from "../config/supabase.js";
import { analysisQueue } from "../services/queue.service.js";
import { AppError } from "../middleware/error.middleware.js";

// ─── Validation schemas ───────────────────────────────────────────
const LyricsSchema = z.object({
  lyrics:  z.string().min(10, "Lyrics must be at least 10 characters").max(5000),
  key:     z.enum(["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"]),
  mode:    z.enum(["major", "minor"]),
  title:   z.string().max(200).optional(),
  artist:  z.string().max(200).optional(),
});

// ─── POST /api/analysis/lyrics ────────────────────────────────────
export async function analyseLyrics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = LyricsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { lyrics, key, mode, title, artist } = parsed.data;
    const jobId = uuidv4();

    // Create job record in Supabase
    await supabaseAdmin.from("analysis_jobs").insert({
      id:         jobId,
      user_id:    req.userId!,
      status:     "pending",
      input_mode: "lyrics",
      progress:   0,
      step:       "Queued…",
    });

    // Enqueue the job
    await analysisQueue.add(
      { type: "lyrics", jobId, userId: req.userId!, input: { lyrics, key, mode, title, artist } },
      { jobId }
    );

    res.status(202).json({
      success: true,
      data: { job_id: jobId, status: "pending" },
    });
  } catch (e) { next(e); }
}

// ─── GET /api/analysis/job/:id ────────────────────────────────────
export async function getJobStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabaseAdmin
      .from("analysis_jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.userId!)
      .single();

    if (error || !job) throw new AppError("Job not found", 404);

    // If complete, attach the result
    let result = null;
    if (job.status === "complete" && job.song_id) {
      const { data: satb } = await supabaseAdmin
        .from("satb_results")
        .select("*")
        .eq("song_id", job.song_id)
        .single();

      if (satb) {
        result = {
          id:      satb.id,
          song_id: satb.song_id,
          key:     satb.key,
          mode:    satb.mode,
          soprano: satb.soprano_data,
          alto:    satb.alto_data,
          tenor:   satb.tenor_data,
          bass:    satb.bass_data,
        };
      }
    }

    res.json({
      success: true,
      data: {
        job_id:   job.id,
        status:   job.status,
        progress: job.progress,
        step:     job.step,
        error:    job.error,
        song_id:  job.song_id,
        result,
      },
    });
  } catch (e) { next(e); }
}

// ─── GET /api/analysis/:id ────────────────────────────────────────
export async function getResult(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const { data: satb, error } = await supabaseAdmin
      .from("satb_results")
      .select("*, songs(title, artist, key, mode, artwork_url, lyrics, source)")
      .eq("id", id)
      .eq("user_id", req.userId!)
      .single();

    if (error || !satb) throw new AppError("Result not found", 404);

    res.json({
      success: true,
      data: {
        id:      satb.id,
        song_id: satb.song_id,
        song:    satb.songs,
        key:     satb.key,
        mode:    satb.mode,
        soprano: satb.soprano_data,
        alto:    satb.alto_data,
        tenor:   satb.tenor_data,
        bass:    satb.bass_data,
        created_at: satb.created_at,
      },
    });
  } catch (e) { next(e); }
}

// ─── GET /api/analysis/song/:songId ───────────────────────────────
export async function getResultBySong(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { songId } = req.params;

    const { data: satb, error } = await supabaseAdmin
      .from("satb_results")
      .select("*, songs(title, artist, key, mode, artwork_url, lyrics, source)")
      .eq("song_id", songId)
      .eq("user_id", req.userId!)
      .single();

    if (error || !satb) throw new AppError("Result not found", 404);

    res.json({ success: true, data: satb });
  } catch (e) { next(e); }
}

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin }              from "../config/supabase.js";
import { analysisQueue }              from "../services/queue.service.js";
import { AppError }                   from "../middleware/error.middleware.js";

const RecordSchema = z.object({
  audio_base64: z.string().min(100, "Audio data is required"),
  mime_type:    z.enum(["audio/webm", "audio/webm;codecs=opus", "audio/ogg", "audio/ogg;codecs=opus", "audio/mp4", "audio/wav"]),
  title:        z.string().max(300).optional(),
  artist:       z.string().max(300).optional(),
});

// ─── POST /api/record ─────────────────────────────────────────────
export async function submitRecording(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = RecordSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { audio_base64, mime_type, title, artist } = parsed.data;

    // Rough size check — base64 is ~33% larger than binary
    const estimatedBytes = Math.round(audio_base64.length * 0.75);
    if (estimatedBytes > 15 * 1024 * 1024) {
      throw new AppError("Recording too large — maximum 15 MB (about 30 seconds)", 400);
    }

    const jobId = uuidv4();

    await supabaseAdmin.from("analysis_jobs").insert({
      id:         jobId,
      user_id:    req.userId!,
      status:     "pending",
      input_mode: "record",
      progress:   0,
      step:       "Queued…",
    });

    await analysisQueue.add(
      {
        type:   "record",
        jobId,
        userId: req.userId!,
        input: { audio_base64, mime_type, title, artist },
      },
      { jobId }
    );

    res.status(202).json({
      success: true,
      data: { job_id: jobId, status: "pending" },
    });
  } catch (e) { next(e); }
}

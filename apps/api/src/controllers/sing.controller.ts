import { v4 as uuidv4 }   from "uuid";
import { z }               from "zod";
import multer              from "multer";
import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin }   from "../config/supabase.js";
import { AppError }        from "../middleware/error.middleware.js";
import { transformVoice }  from "../services/voiceChanger.service.js";
import {
  generateAllSATBSung,
  generateAllBackingTracks,
  buildSingNotes,
} from "../services/singPipeline.service.js";

// ─── Multer for audio upload ──────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Audio files only"));
  },
});

export const voiceUploadMiddleware: RequestHandler = upload.single("audio");

// ─── POST /api/sing/voice-change ──────────────────────────────────
// User uploads a hummed/sung clip → transformed to SATB voice
export async function voiceChange(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) throw new AppError("No audio file provided", 400);

    const partSchema = z.enum(["soprano","alto","tenor","bass"]);
    const partResult = partSchema.safeParse(req.body.voice_part);
    if (!partResult.success) throw new AppError("Invalid voice_part", 400);

    const part        = partResult.data;
    const inputBuffer = req.file.buffer;

    // Transform via ElevenLabs Voice Changer
    const transformedBuffer = await transformVoice(inputBuffer, part);

    if (transformedBuffer.length === 0) {
      throw new AppError("Voice transformation failed", 500);
    }

    // Upload to Supabase Storage
    const path = `${req.userId!}/voice-changed/${uuidv4()}-${part}.mp3`;
    await supabaseAdmin.storage
      .from("audio-outputs")
      .upload(path, transformedBuffer, { contentType: "audio/mpeg", upsert: false });

    const { data: signed } = await supabaseAdmin.storage
      .from("audio-outputs")
      .createSignedUrl(path, 60 * 60 * 24); // 24-hour URL

    res.json({
      success: true,
      data: {
        audio_url: signed?.signedUrl ?? "",
        voice_part: part,
        duration_estimate: Math.round(transformedBuffer.length / 16000),
      },
    });
  } catch (e) { next(e); }
}

// ─── POST /api/sing/generate/:resultId ───────────────────────────
// Generate pitched singing + backing tracks for an existing SATB result
const GenerateSingSchema = z.object({
  tempo: z.number().min(40).max(200).default(90),
  parts: z.array(z.enum(["soprano","alto","tenor","bass"])).optional(),
  include_backing: z.boolean().default(true),
});

export async function generateSung(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { resultId } = req.params;

    const parsed = GenerateSingSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { tempo, include_backing } = parsed.data;
    const partsToGenerate = parsed.data.parts ?? ["soprano","alto","tenor","bass"];

    // Fetch the SATB result
    const { data: satb, error } = await supabaseAdmin
      .from("satb_results")
      .select("*, songs(title, artist, key, mode)")
      .eq("id", resultId)
      .eq("user_id", req.userId!)
      .single();

    if (error || !satb) throw new AppError("Result not found", 404);

    const song = satb.songs as { title: string; artist?: string; key: string; mode: string };

    // Accept the job immediately — singing generation takes ~30s
    const jobId = uuidv4();
    await supabaseAdmin.from("analysis_jobs").insert({
      id:         jobId,
      user_id:    req.userId!,
      song_id:    satb.song_id,
      status:     "processing",
      input_mode: "lyrics", // reuses existing type
      progress:   5,
      step:       "Generating pitched singing…",
    });

    res.status(202).json({
      success: true,
      data: { job_id: jobId, status: "processing" },
    });

    // Run generation async (fire-and-forget from HTTP perspective)
    runSingGeneration({
      jobId,
      resultId: Array.isArray(resultId) ? resultId[0] : resultId,
      satb,
      song,
      userId:          req.userId!,
      tempo,
      partsToGenerate: partsToGenerate as Array<"soprano"|"alto"|"tenor"|"bass">,
      includeBackingTracks: include_backing,
    }).catch((err) => {
      console.error("Sing generation failed:", err);
      supabaseAdmin.from("analysis_jobs")
        .update({ status: "failed", error: err.message })
        .eq("id", jobId);
    });

  } catch (e) { next(e); }
}

// ─── GET /api/sing/status/:jobId ──────────────────────────────────
export async function getSingStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { jobId } = req.params;
    const { data: job } = await supabaseAdmin
      .from("analysis_jobs")
      .select("status, progress, step, error")
      .eq("id", jobId)
      .eq("user_id", req.userId!)
      .single();

    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: job });
  } catch (e) { next(e); }
}

// ─── Async sing generation pipeline ──────────────────────────────
async function runSingGeneration(params: {
  jobId:            string;
  resultId:         string;
  satb:             Record<string, unknown>;
  song:             { title: string; artist?: string; key: string; mode: string };
  userId:           string;
  tempo:            number;
  partsToGenerate:  Array<"soprano"|"alto"|"tenor"|"bass">;
  includeBackingTracks: boolean;
}) {
  const { jobId, resultId, satb, song, userId, tempo, includeBackingTracks } = params;

  const updateProgress = async (progress: number, step: string) => {
    await supabaseAdmin.from("analysis_jobs")
      .update({ progress, step, updated_at: new Date().toISOString() })
      .eq("id", jobId);
  };

  // Build sing notes from stored solfa data
  await updateProgress(10, "Preparing note sequences…");
  const allNotes = {
    soprano: buildSingNotesFromData(satb.soprano_data),
    alto:    buildSingNotesFromData(satb.alto_data),
    tenor:   buildSingNotesFromData(satb.tenor_data),
    bass:    buildSingNotesFromData(satb.bass_data),
  };

  // Generate pitched singing via DiffSinger
  await updateProgress(20, "Generating pitched singing (DiffSinger)…");
  const sungBuffers = await generateAllSATBSung({
    ...allNotes,
    tempo,
    key:  song.key,
    mode: song.mode,
  });
  await updateProgress(65, "Pitched singing complete…");

  // Generate backing tracks via ElevenLabs Music API
  let backingBuffers: Record<string, Buffer> = {};
  if (includeBackingTracks) {
    await updateProgress(65, "Generating backing tracks…");
    backingBuffers = await generateAllBackingTracks(song.key, song.mode, tempo);
    await updateProgress(85, "Backing tracks complete…");
  }

  // Upload all new audio files
  await updateProgress(85, "Uploading audio files…");
  const parts = ["soprano", "alto", "tenor", "bass"] as const;
  const updates: Record<string, unknown> = {};

  for (const part of parts) {
    const sungBuf    = sungBuffers[part];
    const backingBuf = backingBuffers[part];

    if (sungBuf && sungBuf.length > 0) {
      const sungPath = `${userId}/${satb.song_id}/${part}-sung.mp3`;
      await supabaseAdmin.storage.from("audio-outputs")
        .upload(sungPath, sungBuf, { contentType: "audio/mpeg", upsert: true });
      const { data: sungSigned } = await supabaseAdmin.storage.from("audio-outputs")
        .createSignedUrl(sungPath, 60 * 60 * 24 * 7);

      // Merge into existing part data
      const existing = satb[`${part}_data`] as Record<string, unknown> ?? {};
      updates[`${part}_data`] = { ...existing, sung_audio_url: sungSigned?.signedUrl ?? "" };
    }

    if (backingBuf && backingBuf.length > 0) {
      const backPath = `${userId}/${satb.song_id}/${part}-backing.mp3`;
      await supabaseAdmin.storage.from("audio-outputs")
        .upload(backPath, backingBuf, { contentType: "audio/mpeg", upsert: true });
      const { data: backSigned } = await supabaseAdmin.storage.from("audio-outputs")
        .createSignedUrl(backPath, 60 * 60 * 24 * 7);

      const existing = (updates[`${part}_data`] ?? satb[`${part}_data`]) as Record<string, unknown> ?? {};
      updates[`${part}_data`] = { ...existing, backing_audio_url: backSigned?.signedUrl ?? "" };
    }
  }

  // Update SATB result with new audio URLs
  if (Object.keys(updates).length > 0) {
    await supabaseAdmin.from("satb_results").update(updates).eq("id", resultId);
  }

  await supabaseAdmin.from("analysis_jobs")
    .update({ status: "complete", progress: 100, step: "Done!" })
    .eq("id", jobId);
}

function buildSingNotesFromData(partData: unknown) {
  const data = partData as { solfa_notes?: unknown[] } | null;
  if (!data?.solfa_notes?.length) return [];
  return buildSingNotes(
    data.solfa_notes as Parameters<typeof buildSingNotes>[0],
    90
  );
}

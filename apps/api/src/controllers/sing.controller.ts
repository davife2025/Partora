import { v4 as uuidv4 }    from "uuid";
import { z }                from "zod";
import multer               from "multer";
import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin }    from "../config/supabase.js";
import { AppError }         from "../middleware/error.middleware.js";
import { transformVoice }   from "../services/voiceChanger.service.js";
import { generateAllSATBSung, generateAllBackingTracks, buildSingNotes } from "../services/singPipeline.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Audio files only"));
  },
});

export const voiceUploadMiddleware: RequestHandler = upload.single("audio");

export async function voiceChange(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError("No audio file provided", 400);
    const partSchema = z.enum(["soprano","alto","tenor","bass"]);
    const partResult = partSchema.safeParse(req.body.voice_part);
    if (!partResult.success) throw new AppError("Invalid voice_part", 400);

    const part = partResult.data;
    const transformedBuffer = await transformVoice(req.file.buffer, part);
    if (transformedBuffer.length === 0) throw new AppError("Voice transformation failed", 500);

    const path = `${req.userId!}/voice-changed/${uuidv4()}-${part}.mp3`;
    await supabaseAdmin.storage.from("audio-outputs")
      .upload(path, transformedBuffer, { contentType: "audio/mpeg", upsert: false });
    const { data: signed } = await supabaseAdmin.storage.from("audio-outputs")
      .createSignedUrl(path, 60 * 60 * 24);

    res.json({ success: true, data: { audio_url: signed?.signedUrl ?? "", voice_part: part } });
  } catch (e) { next(e); }
}

const GenerateSingSchema = z.object({
  tempo:           z.number().min(40).max(200).default(90),
  parts:           z.array(z.enum(["soprano","alto","tenor","bass"])).optional(),
  include_backing: z.boolean().default(true),
});

export async function generateSung(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const resultId = req.params["resultId"] as string;
    const parsed = GenerateSingSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.errors[0].message, 400);

    const { tempo, include_backing } = parsed.data;

    const { data: satb, error } = await supabaseAdmin
      .from("satb_results")
      .select("*, songs(title,artist,key,mode)")
      .eq("id", resultId)
      .eq("user_id", req.userId!)
      .single();

    if (error || !satb) throw new AppError("Result not found", 404);

    const song = satb.songs as { title:string; artist?:string; key:string; mode:string };
    const jobId = uuidv4();

    await supabaseAdmin.from("analysis_jobs").insert({
      id: jobId, user_id: req.userId!, song_id: satb.song_id,
      status: "processing", input_mode: "lyrics", progress: 5,
      step: "Generating pitched singing…",
    });

    res.status(202).json({ success: true, data: { job_id: jobId, status: "processing" } });

    runSingGeneration({ jobId, resultId, satb, song, userId: req.userId!, tempo, includeBackingTracks: include_backing })
      .catch((err: Error) => {
        supabaseAdmin.from("analysis_jobs").update({ status:"failed", error:err.message }).eq("id", jobId);
      });
  } catch (e) { next(e); }
}

export async function getSingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const jobId = req.params["jobId"] as string;
    const { data: job } = await supabaseAdmin
      .from("analysis_jobs").select("status,progress,step,error")
      .eq("id", jobId).eq("user_id", req.userId!).single();
    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: job });
  } catch (e) { next(e); }
}

async function runSingGeneration(params: {
  jobId:string; resultId:string; satb:Record<string,unknown>;
  song:{title:string;artist?:string;key:string;mode:string};
  userId:string; tempo:number; includeBackingTracks:boolean;
}) {
  const { jobId, resultId, satb, song, userId, tempo, includeBackingTracks } = params;

  const up = async (progress:number, step:string) =>
    supabaseAdmin.from("analysis_jobs").update({ progress, step, updated_at:new Date().toISOString() }).eq("id", jobId);

  await up(10, "Preparing note sequences…");
  const allNotes = {
    soprano: buildSingNotesFromData(satb.soprano_data, tempo),
    alto:    buildSingNotesFromData(satb.alto_data,    tempo),
    tenor:   buildSingNotesFromData(satb.tenor_data,   tempo),
    bass:    buildSingNotesFromData(satb.bass_data,     tempo),
  };

  await up(20, "Generating pitched singing…");
  const sungBuffers = await generateAllSATBSung({ ...allNotes, tempo, key: song.key, mode: song.mode });
  await up(65, "Sung audio complete…");

  let backingBuffers: Record<string,Buffer> = {};
  if (includeBackingTracks) {
    await up(65, "Generating backing tracks…");
    backingBuffers = await generateAllBackingTracks(song.key, song.mode, tempo);
    await up(85, "Backing tracks complete…");
  }

  await up(85, "Uploading audio files…");
  const parts = ["soprano","alto","tenor","bass"] as const;
  const updates: Record<string,unknown> = {};

  for (const part of parts) {
    const sungBuf    = sungBuffers[part];
    const backingBuf = backingBuffers[part];

    if (sungBuf && sungBuf.length > 0) {
      const sungPath = `${userId}/${satb.song_id as string}/${part}-sung.mp3`;
      await supabaseAdmin.storage.from("audio-outputs").upload(sungPath, sungBuf, { contentType:"audio/mpeg", upsert:true });
      const { data: s } = await supabaseAdmin.storage.from("audio-outputs").createSignedUrl(sungPath, 60*60*24*7);
      const existing = (satb[`${part}_data`] ?? {}) as Record<string,unknown>;
      updates[`${part}_data`] = { ...existing, sung_audio_url: s?.signedUrl ?? "" };
    }

    if (backingBuf && backingBuf.length > 0) {
      const backPath = `${userId}/${satb.song_id as string}/${part}-backing.mp3`;
      await supabaseAdmin.storage.from("audio-outputs").upload(backPath, backingBuf, { contentType:"audio/mpeg", upsert:true });
      const { data: s } = await supabaseAdmin.storage.from("audio-outputs").createSignedUrl(backPath, 60*60*24*7);
      const existing = (updates[`${part}_data`] ?? satb[`${part}_data`] ?? {}) as Record<string,unknown>;
      updates[`${part}_data`] = { ...existing, backing_audio_url: s?.signedUrl ?? "" };
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabaseAdmin.from("satb_results").update(updates).eq("id", resultId);
  }
  await supabaseAdmin.from("analysis_jobs").update({ status:"complete", progress:100, step:"Done!" }).eq("id", jobId);
}

function buildSingNotesFromData(partData: unknown, tempo: number) {
  const data = partData as { solfa_notes?: unknown[] } | null;
  if (!data?.solfa_notes?.length) return [];
  return buildSingNotes(data.solfa_notes as Parameters<typeof buildSingNotes>[0], tempo);
}
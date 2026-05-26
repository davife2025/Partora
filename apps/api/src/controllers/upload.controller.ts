import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabaseAdmin } from "../config/supabase.js";
import { analysisQueue } from "../services/queue.service.js";
import { AppError } from "../middleware/error.middleware.js";

// ─── Multer configuration ─────────────────────────────────────────
const ALLOWED_MIME = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/webm",
  "audio/ogg", "audio/aac", "audio/flac", "audio/x-wav",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

export const uploadMiddleware: RequestHandler = upload.single("audio");

// ─── POST /api/upload ─────────────────────────────────────────────
export async function uploadAudio(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) throw new AppError("No audio file provided", 400);

    const { buffer, originalname, mimetype, size } = req.file;
    const title  = (req.body.title  as string | undefined) || undefined;
    const artist = (req.body.artist as string | undefined) || undefined;

    // Validate size again (belt & braces)
    if (size > 50 * 1024 * 1024) {
      throw new AppError("File too large — maximum 50 MB", 400);
    }

    const fileId  = uuidv4();
    const jobId   = uuidv4();
    const storagePath = `${req.userId!}/${fileId}/${originalname}`;

    // Upload raw file to Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("audio-uploads")
      .upload(storagePath, buffer, { contentType: mimetype, upsert: false });

    if (storageError) throw new AppError("Failed to store audio file", 500);

    // Create job record
    await supabaseAdmin.from("analysis_jobs").insert({
      id:         jobId,
      user_id:    req.userId!,
      status:     "pending",
      input_mode: "upload",
      progress:   0,
      step:       "Queued…",
    });

    // Enqueue upload job
    await analysisQueue.add(
      {
        type:     "upload",
        jobId,
        userId:   req.userId!,
        input: {
          storagePath,
          filename:  originalname,
          mimeType:  mimetype,
          title,
          artist,
        },
      },
      { jobId }
    );

    res.status(202).json({
      success: true,
      data: { file_id: fileId, job_id: jobId, status: "pending" },
    });
  } catch (e) { next(e); }
}

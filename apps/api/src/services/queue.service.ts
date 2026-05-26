import Bull from "bull";
import { supabaseAdmin } from "../config/supabase.js";
import { generateSATBHarmonisation } from "./kimiK2.service.js";
import { generateAllSATBAudio }       from "./elevenlabs.service.js";
import type { LyricsAnalysisRequest } from "@partora/types";

// ─── Queue definition ─────────────────────────────────────────────
export const analysisQueue = new Bull("partora-analysis", {
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  },
  defaultJobOptions: {
    attempts:  3,
    backoff:   { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail:     20,
  },
});

// ─── Job payload types ────────────────────────────────────────────
export interface LyricsJobData {
  type: "lyrics";
  jobId: string;
  userId: string;
  input: LyricsAnalysisRequest & { title?: string; artist?: string };
}

export type AnalysisJobData = LyricsJobData;
// Upload/Record/Search variants added in Sessions 5–7

// ─── Queue processor ──────────────────────────────────────────────
analysisQueue.process(async (job) => {
  const data = job.data as AnalysisJobData;

  try {
    // Step 1 — mark processing
    await updateJobStatus(data.jobId, "processing", 0, "Starting analysis…");
    await job.progress(5);

    if (data.type === "lyrics") {
      await processLyricsJob(data, job);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(data.jobId, "failed", 0, undefined, msg);
    throw err;
  }
});

// ─── Lyrics job processor ─────────────────────────────────────────
async function processLyricsJob(
  data: LyricsJobData,
  job: Bull.Job
) {
  // Step 2 — create song record
  await updateJobStatus(data.jobId, "processing", 10, "Saving song…");
  const { data: song, error: songError } = await supabaseAdmin
    .from("songs")
    .insert({
      user_id:    data.userId,
      title:      data.input.title ?? "Untitled",
      artist:     data.input.artist,
      key:        data.input.key,
      mode:       data.input.mode,
      lyrics:     data.input.lyrics,
      source:     "lyrics",
    })
    .select()
    .single();

  if (songError || !song) throw new Error("Failed to create song record");
  await supabaseAdmin.from("analysis_jobs").update({ song_id: song.id }).eq("id", data.jobId);
  await job.progress(20);

  // Step 3 — Kimi K2.6 harmonisation
  await updateJobStatus(data.jobId, "processing", 20, "Generating SATB harmonisation…");
  const satbParts = await generateSATBHarmonisation({
    lyrics: data.input.lyrics,
    key:    data.input.key,
    mode:   data.input.mode,
    title:  data.input.title,
    artist: data.input.artist,
  });
  await job.progress(55);

  // Step 4 — ElevenLabs TTS for all 4 parts
  await updateJobStatus(data.jobId, "processing", 55, "Generating voice audio…");
  const satbTexts = {
    soprano: satbParts.soprano.solfa_text,
    alto:    satbParts.alto.solfa_text,
    tenor:   satbParts.tenor.solfa_text,
    bass:    satbParts.bass.solfa_text,
  };
  const audioResults = await generateAllSATBAudio(satbTexts);
  await job.progress(80);

  // Step 5 — Upload audio to Supabase Storage
  await updateJobStatus(data.jobId, "processing", 80, "Storing audio files…");
  const audioUrls = await uploadAudioFiles(data.userId, song.id, audioResults);
  await job.progress(90);

  // Step 6 — Save SATB results
  await updateJobStatus(data.jobId, "processing", 90, "Saving results…");
  const { error: resultError } = await supabaseAdmin.from("satb_results").insert({
    song_id:       song.id,
    user_id:       data.userId,
    key:           data.input.key,
    mode:          data.input.mode,
    soprano_solfa: satbParts.soprano.solfa_text,
    alto_solfa:    satbParts.alto.solfa_text,
    tenor_solfa:   satbParts.tenor.solfa_text,
    bass_solfa:    satbParts.bass.solfa_text,
    soprano_data:  { ...satbParts.soprano, ...audioUrls.soprano },
    alto_data:     { ...satbParts.alto,    ...audioUrls.alto },
    tenor_data:    { ...satbParts.tenor,   ...audioUrls.tenor },
    bass_data:     { ...satbParts.bass,    ...audioUrls.bass },
  });

  if (resultError) throw new Error("Failed to save SATB results");
  await job.progress(100);

  // Step 7 — mark complete
  await updateJobStatus(data.jobId, "complete", 100, "Done!");
  return { song_id: song.id };
}

// ─── Upload audio buffers to Supabase Storage ─────────────────────
async function uploadAudioFiles(
  userId: string,
  songId: string,
  audioResults: Awaited<ReturnType<typeof generateAllSATBAudio>>
) {
  const parts = ["soprano", "alto", "tenor", "bass"] as const;
  const urls: Record<string, { tts_audio_url: string; timestamps: unknown[] }> = {};

  for (const part of parts) {
    const { buffer, timestamps } = audioResults[part];
    const path = `${userId}/${songId}/${part}-solfa.mp3`;

    await supabaseAdmin.storage
      .from("audio-outputs")
      .upload(path, buffer, { contentType: "audio/mpeg", upsert: true });

    const { data: signed } = await supabaseAdmin.storage
      .from("audio-outputs")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL

    urls[part] = {
      tts_audio_url: signed?.signedUrl ?? "",
      timestamps,
    };
  }

  return urls;
}

// ─── Status helper ────────────────────────────────────────────────
async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  step?: string,
  error?: string
) {
  await supabaseAdmin
    .from("analysis_jobs")
    .update({ status, progress, step, error, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}

// ─── Event listeners ──────────────────────────────────────────────
analysisQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

analysisQueue.on("completed", (job) => {
  console.info(`Job ${job.id} completed`);
});

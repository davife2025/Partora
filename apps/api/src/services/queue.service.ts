import Bull                                            from "bull";
import { supabaseAdmin }                               from "../config/supabase.js";
import { generateSATBHarmonisation }                   from "./kimiK2.service.js";
import { generateAllSATBAudio, isolateVoice }          from "./elevenlabs.service.js";
import { analyseAudio, buildMidiContextString }        from "./audioProcessor.service.js";
import { inferSongKey, generateSATBForKnownSong }      from "./kimiK2Search.service.js";
import type { LyricsAnalysisRequest, MusicalKey, MusicalMode } from "@partora/types";

// ─── Queue ────────────────────────────────────────────────────────
export const analysisQueue = new Bull("partora-analysis", {
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff:  { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail:     20,
  },
});

// ─── Job payload types ────────────────────────────────────────────
export interface LyricsJobData {
  type:   "lyrics";
  jobId:  string;
  userId: string;
  input:  LyricsAnalysisRequest & { title?: string; artist?: string };
}

export interface UploadJobData {
  type:   "upload";
  jobId:  string;
  userId: string;
  input: {
    storagePath: string;
    filename:    string;
    mimeType:    string;
    title?:      string;
    artist?:     string;
  };
}

export interface SearchJobData {
  type:   "search";
  jobId:  string;
  userId: string;
  input: {
    title:       string;
    artist:      string;
    artwork_url?: string;
    duration?:   number;
    preview_url?: string;
    spotify_url?: string;
    song_link?:   string;
    lyrics?:      string;
  };
}

export type AnalysisJobData = LyricsJobData | UploadJobData | SearchJobData;

// ─── Processor ───────────────────────────────────────────────────
analysisQueue.process(async (job) => {
  const data = job.data as AnalysisJobData;
  try {
    await updateJobStatus(data.jobId, "processing", 0, "Starting…");
    await job.progress(5);

    if (data.type === "lyrics") await processLyricsJob(data, job);
    if (data.type === "upload") await processUploadJob(data, job);
    if (data.type === "search") await processSearchJob(data, job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(data.jobId, "failed", 0, undefined, msg);
    throw err;
  }
});

// ─── Search pipeline ──────────────────────────────────────────────
async function processSearchJob(data: SearchJobData, job: Bull.Job) {
  const { title, artist, artwork_url, duration, lyrics } = data.input;

  // Step 1 — Ask Kimi to infer the song key
  await updateJobStatus(data.jobId, "processing", 10, "Inferring musical key…");
  const keyResult = await inferSongKey(title, artist);
  await job.progress(25);

  // Step 2 — Create song record
  await updateJobStatus(data.jobId, "processing", 25, "Saving song details…");
  const song = await createSongRecord({
    userId:      data.userId,
    title,
    artist,
    key:         keyResult.key,
    mode:        keyResult.mode,
    source:      "search",
    artwork_url,
    duration,
    lyrics,
  });
  await supabaseAdmin.from("analysis_jobs").update({ song_id: song.id }).eq("id", data.jobId);
  await job.progress(30);

  // Step 3 — Kimi generates SATB for this known song
  await updateJobStatus(data.jobId, "processing", 30, "Generating SATB harmonisation…");
  const satbRaw = await generateSATBForKnownSong({
    title,
    artist,
    key:    keyResult.key,
    mode:   keyResult.mode,
    lyrics,
  });
  await job.progress(60);

  // Step 4 — map raw to typed VoicePartResult shape
  const satbParts = {
    soprano: mapRawPart(satbRaw.soprano, "soprano"),
    alto:    mapRawPart(satbRaw.alto,    "alto"),
    tenor:   mapRawPart(satbRaw.tenor,   "tenor"),
    bass:    mapRawPart(satbRaw.bass,    "bass"),
  };

  // Step 5 — ElevenLabs TTS all 4 parts
  await updateJobStatus(data.jobId, "processing", 60, "Generating voice audio…");
  const audioResults = await generateAllSATBAudio({
    soprano: satbParts.soprano.solfa_text,
    alto:    satbParts.alto.solfa_text,
    tenor:   satbParts.tenor.solfa_text,
    bass:    satbParts.bass.solfa_text,
  });
  await job.progress(85);

  // Step 6 — Upload + save
  await updateJobStatus(data.jobId, "processing", 85, "Storing audio files…");
  const audioUrls = await uploadAudioFiles(data.userId, song.id, audioResults);

  await saveSATBResult({
    jobId: data.jobId, song, userId: data.userId,
    satbParts, audioUrls,
    key:  keyResult.key,
    mode: keyResult.mode,
  });

  await updateJobStatus(data.jobId, "complete", 100, "Done!");
}

function mapRawPart(
  raw: { part: string; solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string } },
  part: string
) {
  return {
    part,
    solfa_text:  raw.solfa_text ?? "",
    solfa_notes: (raw.solfa_notes ?? []) as never[],
    range:       raw.range ?? { low: "C3", high: "A5" },
  };
}

// ─── Lyrics pipeline ──────────────────────────────────────────────
async function processLyricsJob(data: LyricsJobData, job: Bull.Job) {
  await updateJobStatus(data.jobId, "processing", 10, "Saving song…");
  const song = await createSongRecord({
    userId: data.userId,
    title:  data.input.title ?? "Untitled",
    artist: data.input.artist,
    key:    data.input.key,
    mode:   data.input.mode,
    lyrics: data.input.lyrics,
    source: "lyrics",
  });
  await supabaseAdmin.from("analysis_jobs").update({ song_id: song.id }).eq("id", data.jobId);
  await job.progress(20);

  await updateJobStatus(data.jobId, "processing", 20, "Generating SATB harmonisation…");
  const satbParts = await generateSATBHarmonisation({
    lyrics: data.input.lyrics,
    key:    data.input.key,
    mode:   data.input.mode,
    title:  data.input.title,
    artist: data.input.artist,
  });
  await job.progress(55);

  await updateJobStatus(data.jobId, "processing", 55, "Generating voice audio…");
  const audioResults = await generateAllSATBAudio({
    soprano: satbParts.soprano.solfa_text,
    alto:    satbParts.alto.solfa_text,
    tenor:   satbParts.tenor.solfa_text,
    bass:    satbParts.bass.solfa_text,
  });
  await job.progress(85);

  await updateJobStatus(data.jobId, "processing", 85, "Storing audio…");
  const audioUrls = await uploadAudioFiles(data.userId, song.id, audioResults);
  await saveSATBResult({
    jobId: data.jobId, song, userId: data.userId,
    satbParts, audioUrls,
    key:  data.input.key,
    mode: data.input.mode,
  });
  await updateJobStatus(data.jobId, "complete", 100, "Done!");
}

// ─── Upload pipeline ──────────────────────────────────────────────
async function processUploadJob(data: UploadJobData, job: Bull.Job) {
  await updateJobStatus(data.jobId, "processing", 8, "Retrieving audio file…");
  const { data: fileData, error: dlErr } = await supabaseAdmin.storage
    .from("audio-uploads")
    .download(data.input.storagePath);

  if (dlErr || !fileData) throw new Error("Could not retrieve uploaded audio file");
  const audioBuffer = Buffer.from(await fileData.arrayBuffer());
  await job.progress(12);

  await updateJobStatus(data.jobId, "processing", 12, "Isolating vocals…");
  const cleanBuffer = await isolateVoice(audioBuffer);
  await job.progress(25);

  await updateJobStatus(data.jobId, "processing", 25, "Analysing audio…");
  const analysis = await analyseAudio(cleanBuffer, data.input.filename, data.input.mimeType);
  await job.progress(50);

  await updateJobStatus(data.jobId, "processing", 50, "Saving song details…");
  const song = await createSongRecord({
    userId:  data.userId,
    title:   data.input.title ?? data.input.filename.replace(/\.[^/.]+$/, ""),
    artist:  data.input.artist,
    key:     analysis.key,
    mode:    analysis.mode,
    source:  "upload",
  });
  await supabaseAdmin.from("analysis_jobs").update({ song_id: song.id }).eq("id", data.jobId);
  await job.progress(55);

  await updateJobStatus(data.jobId, "processing", 55, "Generating SATB harmonisation…");
  const midiContext = buildMidiContextString(analysis.midi_notes);
  const satbParts = await generateSATBHarmonisation({
    lyrics: `[Melody extracted from audio]\n${midiContext}`,
    key:    analysis.key,
    mode:   analysis.mode,
    title:  song.title,
    artist: data.input.artist,
  });
  await job.progress(75);

  await updateJobStatus(data.jobId, "processing", 75, "Generating voice audio…");
  const audioResults = await generateAllSATBAudio({
    soprano: satbParts.soprano.solfa_text,
    alto:    satbParts.alto.solfa_text,
    tenor:   satbParts.tenor.solfa_text,
    bass:    satbParts.bass.solfa_text,
  });
  await job.progress(90);

  await updateJobStatus(data.jobId, "processing", 90, "Storing audio files…");
  const audioUrls = await uploadAudioFiles(data.userId, song.id, audioResults);
  await saveSATBResult({
    jobId: data.jobId, song, userId: data.userId,
    satbParts, audioUrls,
    key:  analysis.key,
    mode: analysis.mode,
  });
  await supabaseAdmin.storage.from("audio-uploads").remove([data.input.storagePath]);
  await updateJobStatus(data.jobId, "complete", 100, "Done!");
}

// ─── Shared helpers ───────────────────────────────────────────────
async function createSongRecord(fields: {
  userId: string; title: string; artist?: string;
  key: string; mode: string; source: string;
  lyrics?: string; artwork_url?: string; duration?: number;
}) {
  const { data: song, error } = await supabaseAdmin
    .from("songs")
    .insert({
      user_id:     fields.userId,
      title:       fields.title,
      artist:      fields.artist,
      key:         fields.key,
      mode:        fields.mode,
      lyrics:      fields.lyrics,
      source:      fields.source,
      artwork_url: fields.artwork_url,
      duration:    fields.duration,
    })
    .select()
    .single();

  if (error || !song) throw new Error("Failed to create song record");
  return song as { id: string; title: string };
}

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
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    urls[part] = { tts_audio_url: signed?.signedUrl ?? "", timestamps };
  }
  return urls;
}

async function saveSATBResult({
  jobId, song, userId, satbParts, audioUrls, key, mode,
}: {
  jobId: string;
  song:  { id: string };
  userId: string;
  satbParts: Record<string, { solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string }; part: string }>;
  audioUrls: Record<string, { tts_audio_url: string; timestamps: unknown[] }>;
  key:  string;
  mode: string;
}) {
  const { error } = await supabaseAdmin.from("satb_results").insert({
    song_id:       song.id,
    user_id:       userId,
    key,
    mode,
    soprano_solfa: satbParts.soprano.solfa_text,
    alto_solfa:    satbParts.alto.solfa_text,
    tenor_solfa:   satbParts.tenor.solfa_text,
    bass_solfa:    satbParts.bass.solfa_text,
    soprano_data:  { ...satbParts.soprano, ...audioUrls.soprano },
    alto_data:     { ...satbParts.alto,    ...audioUrls.alto    },
    tenor_data:    { ...satbParts.tenor,   ...audioUrls.tenor   },
    bass_data:     { ...satbParts.bass,    ...audioUrls.bass    },
  });
  if (error) throw new Error("Failed to save SATB results");
  await updateJobStatus(jobId, "complete", 100, "Done!");
}

async function updateJobStatus(
  jobId: string, status: string, progress: number, step?: string, error?: string
) {
  await supabaseAdmin
    .from("analysis_jobs")
    .update({ status, progress, step, error, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}

analysisQueue.on("failed",    (job, err) => console.error(`Job ${job.id} failed:`, err.message));
analysisQueue.on("completed", (job)      => console.info(`Job ${job.id} completed`));

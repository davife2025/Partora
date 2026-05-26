import type { MusicalKey, MusicalMode, InputMode } from "./song.types.js";
import type { SATBResult } from "./voice.types.js";

// ─── REQUEST TYPES ───────────────────────────────────────────────

export interface LyricsAnalysisRequest {
  lyrics: string;
  key: MusicalKey;
  mode: MusicalMode;
  title?: string;
  artist?: string;
}

export interface SearchSongRequest {
  query: string;
}

export interface RecogniseSongRequest {
  audio_base64: string;
  mime_type: "audio/webm" | "audio/wav" | "audio/mp3";
}

// ─── RESPONSE TYPES ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisResponse {
  job_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  result?: SATBResult;
}

export interface SongSearchResponse {
  results: Array<{
    title: string;
    artist: string;
    album?: string;
    artwork_url?: string;
    key?: MusicalKey;
    mode?: MusicalMode;
    duration?: number;
    audd_id?: string;
  }>;
}

export interface UploadResponse {
  file_id: string;
  job_id: string;
  status: "pending";
}

export interface JobStatusResponse {
  job_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  progress?: number;
  step?: string;
  result?: SATBResult;
  error?: string;
}

export interface VoiceCoachMessage {
  role: "user" | "assistant";
  content: string;
  audio_url?: string;
  timestamp: string;
}

export type { InputMode };

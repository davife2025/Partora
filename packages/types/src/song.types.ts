export type MusicalKey =
  | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F"
  | "F#" | "Gb" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B";

export type MusicalMode = "major" | "minor";

export type InputMode = "lyrics" | "upload" | "search" | "record";

export interface Song {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  key: MusicalKey;
  mode: MusicalMode;
  bpm?: number;
  duration?: number;
  artwork_url?: string;
  lyrics?: string;
  source: InputMode;
  source_url?: string;
  created_at: string;
  user_id: string;
}

export interface SongSearchResult {
  title: string;
  artist: string;
  album?: string;
  artwork_url?: string;
  duration?: number;
  audd_id?: string;
  spotify_url?: string;
  apple_music_url?: string;
  preview_url?: string;
}

export interface AnalysisJob {
  id: string;
  song_id?: string;
  status: "pending" | "processing" | "complete" | "failed";
  input_mode: InputMode;
  error?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
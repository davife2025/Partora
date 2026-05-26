export type VoicePart = "soprano" | "alto" | "tenor" | "bass";

export type SolfaSyllable =
  | "Do" | "Di" | "Ra"
  | "Re" | "Ri" | "Me"
  | "Mi"
  | "Fa" | "Fi" | "Se"
  | "Sol" | "Si" | "Le"
  | "La" | "Li" | "Te"
  | "Ti";

export type NoteValue =
  | "whole" | "half" | "quarter"
  | "eighth" | "sixteenth";

export interface SolfaNote {
  syllable: SolfaSyllable;
  octave: number;
  duration: NoteValue;
  frequency: number;
  lyric_syllable?: string;
}

export interface VoicePartResult {
  part: VoicePart;
  range: {
    low: string;
    high: string;
  };
  solfa_notes: SolfaNote[];
  solfa_text: string;
  tts_audio_url?: string;
  sung_audio_url?: string;
  backing_audio_url?: string;
  timestamps?: WordTimestamp[];
}

export interface WordTimestamp {
  syllable: string;
  start_ms: number;
  end_ms: number;
}

export interface SATBResult {
  id: string;
  song_id: string;
  soprano: VoicePartResult;
  alto: VoicePartResult;
  tenor: VoicePartResult;
  bass: VoicePartResult;
  key: string;
  mode: string;
  created_at: string;
}

export const VOICE_RANGES: Record<VoicePart, { low: string; high: string; color: string }> = {
  soprano: { low: "C4", high: "A5", color: "#7F77DD" },
  alto:    { low: "G3", high: "E5", color: "#2DA882" },
  tenor:   { low: "C3", high: "A4", color: "#D4820A" },
  bass:    { low: "E2", high: "E4", color: "#185FA5" },
};

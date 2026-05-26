import { config } from "../config/env.js";
import type { MusicalKey, MusicalMode } from "@partora/types";

const PROCESSOR_URL = process.env.AUDIO_PROCESSOR_URL ?? "http://localhost:5001";

export interface AudioAnalysisResult {
  key:        MusicalKey;
  mode:       MusicalMode;
  confidence: number;
  midi_notes: MidiNote[];
  note_count: number;
  duration:   number;
}

export interface MidiNote {
  midi:      number;
  note_name: string;
  onset:     number;
  offset:    number;
  duration:  number;
  velocity:  number;
  frequency: number;
}

/**
 * Send audio file buffer to Python microservice for full analysis.
 * Returns detected key, mode, and MIDI note sequence.
 */
export async function analyseAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<AudioAnalysisResult> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([audioBuffer], { type: mimeType }),
    filename
  );

  const res = await fetch(`${PROCESSOR_URL}/analyse`, {
    method: "POST",
    body:   form,
    signal: AbortSignal.timeout(120_000), // 2 min timeout
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    throw new Error(`Audio processor error ${res.status}: ${err}`);
  }

  const data = await res.json() as { success: boolean } & AudioAnalysisResult;
  if (!data.success) throw new Error("Audio analysis failed");

  return data;
}

/**
 * Build a MIDI-as-text representation for Kimi K2.6.
 * Converts the note list to a format the LLM understands:
 * "C4(0.0s) E4(0.25s) G4(0.5s) C5(0.75s)…"
 */
export function buildMidiContextString(
  notes: MidiNote[],
  maxNotes = 120
): string {
  return notes
    .slice(0, maxNotes)
    .map((n) => `${n.note_name}(${n.onset.toFixed(2)}s)`)
    .join(" ");
}

/**
 * Check if the Python microservice is healthy.
 */
export async function checkProcessorHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${PROCESSOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Re-export config for use in queue ──────────────────────────────
export { config };

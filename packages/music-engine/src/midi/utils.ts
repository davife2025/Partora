import type { NoteValue } from "@partora/types";

/**
 * Note value → duration in seconds (at a given BPM)
 */
export function noteDurationSeconds(value: NoteValue, bpm: number): number {
  const beatDuration = 60 / bpm;
  const map: Record<NoteValue, number> = {
    whole: beatDuration * 4,
    half: beatDuration * 2,
    quarter: beatDuration,
    eighth: beatDuration / 2,
    sixteenth: beatDuration / 4,
  };
  return map[value];
}

/**
 * Convert seconds to milliseconds
 */
export function toMs(seconds: number): number {
  return Math.round(seconds * 1000);
}

/**
 * Frequency in Hz for a MIDI note number (A4 = 440Hz)
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Parse a Basic Pitch MIDI-as-text note event string.
 * Expected format per line: "pitch_midi onset_sec duration_sec velocity"
 * e.g. "64 0.25 0.5 80"
 */
export interface BasicPitchNote {
  midi: number;
  onset: number;
  duration: number;
  velocity: number;
}

export function parseBasicPitchOutput(text: string): BasicPitchNote[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [midi, onset, duration, velocity] = line.split(/\s+/).map(Number);
      return { midi, onset, duration, velocity };
    });
}

/**
 * Detect the most likely key from a list of MIDI notes.
 * Uses a simple Krumhansl-Schmuckler-style profile (major only for MVP).
 */
export function detectKeyFromMidi(midiNotes: number[]): {
  key: string;
  mode: "major" | "minor";
} {
  const profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                   2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const counts = new Array(12).fill(0);
  for (const m of midiNotes) counts[m % 12]++;

  const keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  let bestKey = "C";
  let bestScore = -Infinity;

  for (let root = 0; root < 12; root++) {
    let score = 0;
    for (let i = 0; i < 12; i++) {
      score += profile[i] * counts[(root + i) % 12];
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = keys[root];
    }
  }

  return { key: bestKey, mode: "major" };
}

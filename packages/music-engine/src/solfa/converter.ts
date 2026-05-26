import type { MusicalKey, MusicalMode, SolfaSyllable } from "@partora/types";

/**
 * Chromatic scale degrees (0 = root)
 * Maps semitone offset from tonic → solfa syllable (major scale context)
 */
const MAJOR_SCALE_MAP: Record<number, SolfaSyllable> = {
  0: "Do",
  1: "Di",
  2: "Re",
  3: "Me",
  4: "Mi",
  5: "Fa",
  6: "Fi",
  7: "Sol",
  8: "Le",
  9: "La",
  10: "Te",
  11: "Ti",
};

const MINOR_SCALE_MAP: Record<number, SolfaSyllable> = {
  0: "Do",
  1: "Di",
  2: "Re",
  3: "Me",
  4: "Mi",
  5: "Fa",
  6: "Fi",
  7: "Sol",
  8: "Le",
  9: "La",
  10: "Te",
  11: "Ti",
};

/**
 * MIDI note number for each key root (C4 = 60)
 */
export const KEY_TO_MIDI: Record<MusicalKey, number> = {
  C: 60, "C#": 61, Db: 61,
  D: 62, "D#": 63, Eb: 63,
  E: 64,
  F: 65, "F#": 66, Gb: 66,
  G: 67, "G#": 68, Ab: 68,
  A: 69, "A#": 70, Bb: 70,
  B: 71,
};

/**
 * Convert a MIDI note number to a tonic solfa syllable
 * relative to the given key and mode.
 */
export function midiToSolfa(
  midi: number,
  key: MusicalKey,
  mode: MusicalMode
): SolfaSyllable {
  const root = KEY_TO_MIDI[key];
  const semitones = ((midi - root) % 12 + 12) % 12;
  const map = mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
  return map[semitones] ?? "Do";
}

/**
 * Convert a note name (e.g. "G4") to MIDI number
 */
export function noteNameToMidi(note: string): number {
  const match = note.match(/^([A-G]#?b?)(\d)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const [, pitch, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const pitchMap: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
    E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
    Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
  };
  return (octave + 1) * 12 + (pitchMap[pitch] ?? 0);
}

/**
 * Convert a MIDI number back to a note name (e.g. 69 → "A4")
 */
export function midiToNoteName(midi: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F",
                 "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return `${note}${octave}`;
}

/**
 * Convert a note name directly to solfa syllable
 */
export function noteToSolfa(
  note: string,
  key: MusicalKey,
  mode: MusicalMode
): SolfaSyllable {
  return midiToSolfa(noteNameToMidi(note), key, mode);
}

/**
 * Build a human-readable solfa string from an array of notes
 * e.g. ["C4","E4","G4"] in C major → "Do Mi Sol"
 */
export function buildSolfaString(
  notes: string[],
  key: MusicalKey,
  mode: MusicalMode
): string {
  return notes.map((n) => noteToSolfa(n, key, mode)).join(" ");
}

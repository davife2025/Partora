import type { VoicePart, MusicalKey, MusicalMode } from "@partora/types";
import { VOICE_RANGES } from "@partora/types";
import { noteNameToMidi, midiToNoteName } from "../solfa/converter.js";

/**
 * Clamp a MIDI note into a voice part's comfortable range
 */
export function clampToRange(midi: number, part: VoicePart): number {
  const range = VOICE_RANGES[part];
  const low = noteNameToMidi(range.low);
  const high = noteNameToMidi(range.high);

  while (midi < low) midi += 12;
  while (midi > high) midi -= 12;

  return midi;
}

/**
 * Transpose a melody note into a target voice part's range.
 * Preserves the scale degree, shifts octave as needed.
 */
export function transposeForPart(
  note: string,
  part: VoicePart
): string {
  const midi = noteNameToMidi(note);
  const clamped = clampToRange(midi, part);
  return midiToNoteName(clamped);
}

/**
 * Build a simple SATB chord from a root note in a given key.
 * Returns one representative note per voice part.
 */
export function buildSATBChord(
  root: string,
  key: MusicalKey,
  mode: MusicalMode
): Record<VoicePart, string> {
  const rootMidi = noteNameToMidi(root);
  const third = mode === "major" ? 4 : 3;

  // Chord tones: root, third, fifth, octave
  const soprano = midiToNoteName(clampToRange(rootMidi + 12, "soprano"));
  const alto    = midiToNoteName(clampToRange(rootMidi + third + 7, "alto"));
  const tenor   = midiToNoteName(clampToRange(rootMidi + 7, "tenor"));
  const bass    = midiToNoteName(clampToRange(rootMidi, "bass"));

  return { soprano, alto, tenor, bass };
}

/**
 * Parse a key string like "G major" into structured parts
 */
export function parseKeyString(keyStr: string): {
  key: MusicalKey;
  mode: MusicalMode;
} {
  const parts = keyStr.trim().split(/\s+/);
  const key = parts[0] as MusicalKey;
  const mode = (parts[1]?.toLowerCase() === "minor" ? "minor" : "major") as MusicalMode;
  return { key, mode };
}

/**
 * Return the relative major/minor key
 */
export function getRelativeKey(
  key: MusicalKey,
  mode: MusicalMode
): { key: MusicalKey; mode: MusicalMode } {
  const keys: MusicalKey[] = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B",
  ];
  const idx = keys.indexOf(key);
  if (mode === "major") {
    // Relative minor is 3 semitones down
    const relIdx = ((idx - 3) + 12) % 12;
    return { key: keys[relIdx], mode: "minor" };
  } else {
    // Relative major is 3 semitones up
    const relIdx = (idx + 3) % 12;
    return { key: keys[relIdx], mode: "major" };
  }
}

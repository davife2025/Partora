import { InferenceClient } from "@huggingface/inference";
import { config }          from "../config/env.js";
import type { VoicePart }  from "@partora/types";
import { VOICE_RANGES }    from "@partora/types";

const client = new InferenceClient(config.huggingface.apiKey);

// ─── Voice model IDs per SATB part ───────────────────────────────
// SoulX-Singer: controllable singing generation from HuggingFace
const SINGING_MODELS: Record<VoicePart, string> = {
  soprano: process.env.HF_MODEL_SOPRANO ?? "ASLP-lab/DiffSinger",
  alto:    process.env.HF_MODEL_ALTO    ?? "ASLP-lab/DiffSinger",
  tenor:   process.env.HF_MODEL_TENOR   ?? "ASLP-lab/DiffSinger",
  bass:    process.env.HF_MODEL_BASS    ?? "ASLP-lab/DiffSinger",
};

// Speaker IDs within DiffSinger for each voice type
const SPEAKER_IDS: Record<VoicePart, number> = {
  soprano: 0,
  alto:    1,
  tenor:   2,
  bass:    3,
};

export interface SingingInput {
  notes:     SingNote[];
  voicePart: VoicePart;
  tempo:     number;   // BPM
  key:       string;
  mode:      string;
}

export interface SingNote {
  note_name:      string;   // e.g. "C4"
  duration_beats: number;   // e.g. 1.0 = one beat
  lyric_syllable: string;   // e.g. "Do" or "A-"
  velocity:       number;   // 0–127
}

/**
 * Generate pitched singing audio for a voice part using DiffSinger.
 * Falls back to ElevenLabs TTS if DiffSinger is unavailable.
 */
export async function generateSungAudio(
  input: SingingInput
): Promise<Buffer> {
  try {
    return await callDiffSinger(input);
  } catch (err) {
    console.warn("DiffSinger failed, falling back to ElevenLabs TTS:", err);
    return await fallbackTTS(input);
  }
}

// ─── DiffSinger call ──────────────────────────────────────────────
async function callDiffSinger(input: SingingInput): Promise<Buffer> {
  const { notes, voicePart, tempo } = input;
  const speakerId = SPEAKER_IDS[voicePart];
  const range     = VOICE_RANGES[voicePart];

  // Build MusicXML-like note sequence for DiffSinger
  const noteSequence = buildNoteSequence(notes, tempo);

  // Call HuggingFace Inference API
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${SINGING_MODELS[voicePart]}`,
    {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${config.huggingface.apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        inputs: {
          text:       notes.map((n) => n.lyric_syllable).join(" "),
          notes:      noteSequence,
          speaker_id: speakerId,
          tempo,
          pitch_range: { low: range.low, high: range.high },
        },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );

  if (!response.ok) {
    const err = await response.text().catch(() => "unknown");
    throw new Error(`DiffSinger error ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Note sequence builder ────────────────────────────────────────
function buildNoteSequence(
  notes: SingNote[],
  tempo: number
): Array<{ pitch: string; duration: number; lyric: string; velocity: number }> {
  const secPerBeat = 60 / tempo;
  return notes.map((n) => ({
    pitch:    n.note_name,
    duration: n.duration_beats * secPerBeat,
    lyric:    n.lyric_syllable,
    velocity: n.velocity,
  }));
}

// ─── Fallback: ElevenLabs Musical TTS ────────────────────────────
async function fallbackTTS(input: SingingInput): Promise<Buffer> {
  const { solfaToSpeech } = await import("./elevenlabs.service.js");
  const solfaText = input.notes.map((n) => n.lyric_syllable).join(" ");
  return solfaToSpeech(solfaText, input.voicePart);
}

/**
 * Convert VoicePartResult solfa notes to SingNote array for DiffSinger.
 * Maps solfa syllables to actual MIDI note names using the detected key.
 */
export function buildSingNotes(
  solfaNotes: Array<{
    syllable:      string;
    octave:        number;
    duration:      string;
    note_name?:    string;
    lyric_syllable?: string;
    frequency:     number;
  }>,
  tempo: number
): SingNote[] {
  const durationBeats: Record<string, number> = {
    whole:     4,
    half:      2,
    quarter:   1,
    eighth:    0.5,
    sixteenth: 0.25,
  };

  return solfaNotes.map((n) => ({
    note_name:      n.note_name ?? frequencyToNoteName(n.frequency),
    duration_beats: durationBeats[n.duration] ?? 1,
    lyric_syllable: n.lyric_syllable ?? n.syllable,
    velocity:       80,
  }));
}

// ─── Frequency → note name ────────────────────────────────────────
function frequencyToNoteName(frequency: number): string {
  if (frequency <= 0) return "C4";
  const midi  = Math.round(12 * Math.log2(frequency / 440) + 69);
  const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}${octave}`;
}

/**
 * Generate all 4 SATB sung audio files in parallel.
 */
export async function generateAllSATBSung(params: {
  soprano: SingNote[];
  alto:    SingNote[];
  tenor:   SingNote[];
  bass:    SingNote[];
  tempo:   number;
  key:     string;
  mode:    string;
}): Promise<Record<VoicePart, Buffer>> {
  const parts: VoicePart[] = ["soprano", "alto", "tenor", "bass"];

  const results = await Promise.allSettled(
    parts.map((part) =>
      generateSungAudio({
        notes:     params[part],
        voicePart: part,
        tempo:     params.tempo,
        key:       params.key,
        mode:      params.mode,
      })
    )
  );

  const buffers: Record<string, Buffer> = {};
  parts.forEach((part, i) => {
    const result = results[i];
    buffers[part] = result.status === "fulfilled"
      ? result.value
      : Buffer.alloc(0); // empty on failure — TTS already stored
  });

  return buffers as Record<VoicePart, Buffer>;
}

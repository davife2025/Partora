import { InferenceClient } from "@huggingface/inference";
import { config } from "../config/env.js";
import type {
  MusicalKey,
  MusicalMode,
  VoicePart,
  VoicePartResult,
  SolfaNote,
  NoteValue,
} from "@partora/types";
import { VOICE_RANGES } from "@partora/types";
import { midiToFrequency, noteNameToMidi } from "@partora/music-engine";

const client = new InferenceClient(config.huggingface.apiKey);

// ─── System prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Partora's expert music theory engine specialising in SATB choral harmonisation and tonic solfa notation.

Given song lyrics and a musical key, you generate all four voice parts: Soprano, Alto, Tenor, Bass.

Rules you MUST follow:
1. Every lyric syllable gets exactly one solfa note assigned to it.
2. Voice ranges: Soprano C4–A5, Alto G3–E5, Tenor C3–A4, Bass E2–E4.
3. Use proper 4-part harmony voice-leading: avoid parallel fifths/octaves, resolve leading tones, keep contrary motion where possible.
4. Tonic solfa syllables: Do Di Ra Re Ri Me Mi Fa Fi Se Sol Si Le La Li Te Ti (chromatic).
5. Note durations: whole | half | quarter | eighth | sixteenth.
6. Output ONLY valid JSON — no markdown, no explanation, no preamble.

Output schema:
{
  "soprano": {
    "part": "soprano",
    "range": { "low": "C4", "high": "A5" },
    "solfa_text": "Do Mi Sol Mi Do",
    "solfa_notes": [
      { "syllable": "Do", "octave": 4, "duration": "quarter", "note_name": "C4", "lyric_syllable": "Hal-" },
      ...
    ]
  },
  "alto": { ... },
  "tenor": { ... },
  "bass": { ... }
}`;

// ─── Input type ───────────────────────────────────────────────────
export interface HarmonisationInput {
  lyrics: string;
  key: MusicalKey;
  mode: MusicalMode;
  title?: string;
  artist?: string;
}

// ─── Raw output from Kimi ─────────────────────────────────────────
interface RawSolfaNote {
  syllable: string;
  octave: number;
  duration: string;
  note_name: string;
  lyric_syllable?: string;
}

interface RawVoicePart {
  part: VoicePart;
  range: { low: string; high: string };
  solfa_text: string;
  solfa_notes: RawSolfaNote[];
}

interface RawHarmonisation {
  soprano: RawVoicePart;
  alto: RawVoicePart;
  tenor: RawVoicePart;
  bass: RawVoicePart;
}

// ─── Main function ────────────────────────────────────────────────
export async function generateSATBHarmonisation(
  input: HarmonisationInput
): Promise<Record<VoicePart, Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url" | "timestamps">>> {
  const userPrompt = buildPrompt(input);

  let raw: RawHarmonisation;

  try {
    const output = await client.chatCompletion({
      model: config.huggingface.modelId,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.3, // Low temp for consistent music theory
    });

    const text = output.choices[0]?.message?.content ?? "";
    raw = parseKimiResponse(text);
  } catch (err) {
    console.error("Kimi K2.6 harmonisation failed:", err);
    throw new Error("Failed to generate harmonisation. Please try again.");
  }

  return {
    soprano: mapVoicePart(raw.soprano),
    alto:    mapVoicePart(raw.alto),
    tenor:   mapVoicePart(raw.tenor),
    bass:    mapVoicePart(raw.bass),
  };
}

// ─── Prompt builder ───────────────────────────────────────────────
function buildPrompt(input: HarmonisationInput): string {
  const lines = [
    input.title  ? `Song title: "${input.title}"` : null,
    input.artist ? `Artist: "${input.artist}"`    : null,
    `Key: ${input.key} ${input.mode}`,
    ``,
    `Lyrics:`,
    input.lyrics.trim(),
    ``,
    `Generate a complete SATB harmonisation with tonic solfa for each voice part.`,
    `Map every lyric syllable to a solfa note. Return only JSON.`,
  ].filter((l) => l !== null).join("\n");

  return lines;
}

// ─── Response parser ──────────────────────────────────────────────
function parseKimiResponse(text: string): RawHarmonisation {
  // Strip markdown fences if model wraps in ```json
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in Kimi response");

  const jsonStr = cleaned.slice(start, end + 1);
  return JSON.parse(jsonStr) as RawHarmonisation;
}

// ─── Map raw → typed ──────────────────────────────────────────────
function mapVoicePart(
  raw: RawVoicePart
): Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url" | "timestamps"> {
  const range = VOICE_RANGES[raw.part];

  const solfa_notes: SolfaNote[] = (raw.solfa_notes ?? []).map((n) => ({
    syllable:      n.syllable as SolfaNote["syllable"],
    octave:        n.octave,
    duration:      (n.duration ?? "quarter") as NoteValue,
    frequency:     midiToFrequency(noteNameToMidi(n.note_name ?? `C${n.octave}`)),
    lyric_syllable: n.lyric_syllable,
  }));

  return {
    part:       raw.part,
    range:      { low: raw.range?.low ?? range.low, high: raw.range?.high ?? range.high },
    solfa_notes,
    solfa_text: raw.solfa_text ?? solfa_notes.map((n) => n.syllable).join(" "),
  };
}

// ─── Image-based analysis (sheet music photo via Kimi vision) ─────
export async function analyseSheetMusicImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png"
): Promise<{ key: string; mode: string; notes: string[] }> {
  const output = await client.chatCompletion({
    model: config.huggingface.modelId,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
          {
            type: "text",
            text: `Analyse this sheet music image. Extract:
1. The musical key and mode
2. The sequence of note names (e.g. C4, D4, E4)

Return ONLY JSON: { "key": "G", "mode": "major", "notes": ["G4","A4","B4",...] }`,
          },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.1,
  });

  const text = output.choices[0]?.message?.content ?? "{}";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

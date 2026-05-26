import { InferenceClient } from "@huggingface/inference";
import { config } from "../config/env.js";
import type { MusicalKey, MusicalMode, VoicePartResult, VoicePart } from "@partora/types";

const client = new InferenceClient(config.huggingface.apiKey);

const SYSTEM_PROMPT = `You are Partora's music theory engine. You are an expert in SATB choral harmonisation and tonic solfa notation.

Given song lyrics and a musical key, you will:
1. Analyse the melodic structure of the lyrics
2. Generate all four voice parts: Soprano, Alto, Tenor, Bass
3. For each part, provide the tonic solfa syllables (Do Re Mi Fa Sol La Ti) mapped to each lyric syllable
4. Ensure each voice part stays within its natural range
5. Follow standard 4-part harmony voice leading rules

Always respond in valid JSON matching the requested schema.`;

export interface HarmonisationInput {
  lyrics: string;
  key: MusicalKey;
  mode: MusicalMode;
  title?: string;
}

export interface HarmonisationOutput {
  soprano: Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url">;
  alto: Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url">;
  tenor: Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url">;
  bass: Omit<VoicePartResult, "tts_audio_url" | "sung_audio_url" | "backing_audio_url">;
}

export async function generateSATBHarmonisation(
  input: HarmonisationInput
): Promise<HarmonisationOutput> {
  const userPrompt = `
Song: "${input.title ?? "Untitled"}"
Key: ${input.key} ${input.mode}
Lyrics:
${input.lyrics}

Generate SATB harmonisation with tonic solfa for each voice part.
Return ONLY a JSON object with keys: soprano, alto, tenor, bass.
Each part must have: part, range (low, high), solfa_notes array, solfa_text string.
Each solfa_note: { syllable, octave, duration, frequency, lyric_syllable }
`;

  // Stub: actual HuggingFace streaming call — wired in Session 4
  // const stream = client.chatCompletionStream({ ... });

  // Placeholder response for scaffold
  const placeholder = (part: VoicePart) => ({
    part,
    range: { low: "C3", high: "A5" },
    solfa_notes: [],
    solfa_text: "Do Re Mi Fa Sol La Ti Do",
  });

  console.info("KimiK2 harmonisation stub called", { input, userPrompt });
  void client; // suppress unused warning until Session 4

  return {
    soprano: placeholder("soprano"),
    alto:    placeholder("alto"),
    tenor:   placeholder("tenor"),
    bass:    placeholder("bass"),
  };
}

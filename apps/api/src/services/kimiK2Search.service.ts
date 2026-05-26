import { InferenceClient } from "@huggingface/inference";
import { config } from "../config/env.js";
import type { MusicalKey, MusicalMode } from "@partora/types";

const client = new InferenceClient(config.huggingface.apiKey);

/**
 * Ask Kimi K2.6 to infer the key and mode of a known song.
 * Used by Mode 3 (search) where we have title + artist but no audio.
 * Kimi's training data includes extensive music theory knowledge.
 */
export async function inferSongKey(
  title: string,
  artist: string
): Promise<{ key: MusicalKey; mode: MusicalMode; confidence: "high" | "medium" | "low" }> {
  const prompt = `What is the musical key and mode of the song "${title}" by ${artist}?

Return ONLY valid JSON in this exact format:
{
  "key": "G",
  "mode": "major",
  "confidence": "high"
}

confidence must be "high" (well-known song, certain), "medium" (likely but not certain), or "low" (unknown/guessing).
key must be one of: C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B
mode must be "major" or "minor"
No explanation. JSON only.`;

  try {
    const output = await client.chatCompletion({
      model: config.huggingface.modelId,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.1,
    });

    const text    = output.choices[0]?.message?.content ?? "{}";
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const start   = cleaned.indexOf("{");
    const end     = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON");

    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
      key: MusicalKey; mode: MusicalMode; confidence: "high" | "medium" | "low";
    };

    return parsed;
  } catch {
    // Fallback to C major if inference fails
    return { key: "C", mode: "major", confidence: "low" };
  }
}

/**
 * Generate SATB harmonisation for a known song (search mode).
 * Kimi knows the melody of many well-known songs from training data.
 */
export async function generateSATBForKnownSong(params: {
  title:  string;
  artist: string;
  key:    MusicalKey;
  mode:   MusicalMode;
  lyrics?: string;
}): Promise<{
  soprano: { part: string; solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string } };
  alto:    { part: string; solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string } };
  tenor:   { part: string; solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string } };
  bass:    { part: string; solfa_text: string; solfa_notes: unknown[]; range: { low: string; high: string } };
}> {
  const lyricsSection = params.lyrics
    ? `\nLyrics:\n${params.lyrics}`
    : `\n(Generate based on your knowledge of this song's melody and structure.)`;

  const prompt = `You are Partora's music theory engine. Generate a complete SATB harmonisation with tonic solfa for the song "${params.title}" by ${params.artist} in ${params.key} ${params.mode}.${lyricsSection}

Use your music theory knowledge to reconstruct the melody and harmonise all four voice parts.

Voice ranges: Soprano C4–A5, Alto G3–E5, Tenor C3–A4, Bass E2–E4.
Solfa syllables: Do Di Ra Re Ri Me Mi Fa Fi Se Sol Si Le La Li Te Ti

Return ONLY valid JSON:
{
  "soprano": { "part": "soprano", "range": { "low": "C4", "high": "A5" }, "solfa_text": "Do Mi Sol...", "solfa_notes": [{ "syllable": "Do", "octave": 4, "duration": "quarter", "note_name": "C4", "lyric_syllable": "A-" }] },
  "alto":    { ... },
  "tenor":   { ... },
  "bass":    { ... }
}`;

  const output = await client.chatCompletion({
    model:       config.huggingface.modelId,
    messages:    [{ role: "user", content: prompt }],
    max_tokens:  4096,
    temperature: 0.3,
  });

  const text    = output.choices[0]?.message?.content ?? "{}";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start   = cleaned.indexOf("{");
  const end     = cleaned.lastIndexOf("}");

  return JSON.parse(cleaned.slice(start, end + 1));
}

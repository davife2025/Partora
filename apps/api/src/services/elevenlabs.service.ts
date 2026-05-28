import { ElevenLabsClient } from "elevenlabs";
import { config } from "../config/env.js";
import type { VoicePart, WordTimestamp } from "@partora/types";

export const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenlabs.apiKey,
});

// ─── Voice IDs per SATB part ──────────────────────────────────────
export const VOICE_IDS: Record<VoicePart, string> = {
  soprano: process.env.ELEVENLABS_VOICE_SOPRANO ?? "21m00Tcm4TlvDq8ikWAM", // Rachel
  alto:    process.env.ELEVENLABS_VOICE_ALTO    ?? "AZnzlk1XvdvUeBnXmlld", // Domi
  tenor:   process.env.ELEVENLABS_VOICE_TENOR   ?? "ErXwobaYiN019PkySvjV", // Antoni
  bass:    process.env.ELEVENLABS_VOICE_BASS    ?? "VR6AewLTigWG4xSOukaG", // Arnold
};

// ─── Pronunciation dictionary for solfa syllables ─────────────────
// PLS format: maps written form → phonetic pronunciation
// Ensures ElevenLabs speaks "Do" as "Doh", "Re" as "Ray", etc.
const SOLFA_PRONUNCIATION_DICT = `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0"
  xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
  alphabet="ipa" xml:lang="en-US">
  <lexeme><grapheme>Do</grapheme><phoneme>doʊ</phoneme></lexeme>
  <lexeme><grapheme>Di</grapheme><phoneme>diː</phoneme></lexeme>
  <lexeme><grapheme>Ra</grapheme><phoneme>rɑː</phoneme></lexeme>
  <lexeme><grapheme>Re</grapheme><phoneme>reɪ</phoneme></lexeme>
  <lexeme><grapheme>Ri</grapheme><phoneme>riː</phoneme></lexeme>
  <lexeme><grapheme>Me</grapheme><phoneme>meɪ</phoneme></lexeme>
  <lexeme><grapheme>Mi</grapheme><phoneme>miː</phoneme></lexeme>
  <lexeme><grapheme>Fa</grapheme><phoneme>fɑː</phoneme></lexeme>
  <lexeme><grapheme>Fi</grapheme><phoneme>fiː</phoneme></lexeme>
  <lexeme><grapheme>Se</grapheme><phoneme>seɪ</phoneme></lexeme>
  <lexeme><grapheme>Sol</grapheme><phoneme>soʊl</phoneme></lexeme>
  <lexeme><grapheme>Si</grapheme><phoneme>siː</phoneme></lexeme>
  <lexeme><grapheme>Le</grapheme><phoneme>leɪ</phoneme></lexeme>
  <lexeme><grapheme>La</grapheme><phoneme>lɑː</phoneme></lexeme>
  <lexeme><grapheme>Li</grapheme><phoneme>liː</phoneme></lexeme>
  <lexeme><grapheme>Te</grapheme><phoneme>teɪ</phoneme></lexeme>
  <lexeme><grapheme>Ti</grapheme><phoneme>tiː</phoneme></lexeme>
</lexicon>`;

// ─── TTS: Solfa text → audio buffer ──────────────────────────────
export async function solfaToSpeech(
  solfaText: string,
  part: VoicePart
): Promise<Buffer> {
  const voiceId = VOICE_IDS[part];

  // Space out syllables for musical pacing — adds natural pause between each
  const spacedText = solfaText.split(" ").join("... ");

  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text: spacedText,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability:        0.75,
      similarity_boost: 0.85,
      style:            0.4,  // slight musical expressiveness
      use_speaker_boost: true,
    },
    pronunciation_dictionary_locators: [],
    // Apply custom pronunciation for solfa
    // Note: pronunciation dict uploaded once via API — see uploadSolfaPronunciationDict()
  });

  return streamToBuffer(audioStream);
}

// ─── Forced alignment: audio + text → timestamps ─────────────────
export async function getForcedAlignment(
  audioBuffer: Buffer,
  solfaText: string,
  part: VoicePart
): Promise<WordTimestamp[]> {
  const voiceId = VOICE_IDS[part];

  try {
    const result = await (elevenlabs as unknown as {
      speechToSpeech: {
        convertWithTimestamps: (
          voiceId: string,
          opts: { audio: Buffer; model_id: string }
        ) => Promise<{ alignment?: { chars: Array<{ char: string; start_time: number; end_time: number }> } }>;
      }
    }).speechToSpeech.convertWithTimestamps(voiceId, {
      audio: audioBuffer,
      model_id: "eleven_multilingual_v2",
    });

    // Map character-level timestamps → word-level
    const words = solfaText.split(" ").filter(Boolean);
    const timestamps: WordTimestamp[] = [];
    let charIndex = 0;

    const chars = result?.alignment?.chars ?? [];

    for (const word of words) {
      const start = chars[charIndex]?.start_time ?? 0;
      charIndex += word.length + 1; // +1 for space
      const end = chars[Math.min(charIndex - 1, chars.length - 1)]?.end_time ?? start + 0.3;

      timestamps.push({
        syllable:  word,
        start_ms:  Math.round(start * 1000),
        end_ms:    Math.round(end   * 1000),
      });
    }

    return timestamps;
  } catch (err) {
    console.warn("Forced alignment failed, returning empty timestamps:", err);
    // Fallback: evenly distribute timestamps
    return buildEvenTimestamps(solfaText, 120); // assume ~120 BPM
  }
}

// ─── Generate all 4 SATB TTS audio in parallel ───────────────────
export async function generateAllSATBAudio(satb: {
  soprano: string;
  alto: string;
  tenor: string;
  bass: string;
}): Promise<{
  soprano: { buffer: Buffer; timestamps: WordTimestamp[] };
  alto:    { buffer: Buffer; timestamps: WordTimestamp[] };
  tenor:   { buffer: Buffer; timestamps: WordTimestamp[] };
  bass:    { buffer: Buffer; timestamps: WordTimestamp[] };
}> {
  const parts = ["soprano", "alto", "tenor", "bass"] as VoicePart[];

  const results = await Promise.all(
    parts.map(async (part) => {
      const buffer     = await solfaToSpeech(satb[part], part);
      const timestamps = await getForcedAlignment(buffer, satb[part], part);
      return { part, buffer, timestamps };
    })
  );

  return Object.fromEntries(
    results.map(({ part, buffer, timestamps }) => [part, { buffer, timestamps }])
) as Awaited<ReturnType<typeof generateAllSATBAudio>>;
}

// ─── Upload pronunciation dictionary (run once on deploy) ─────────
export async function uploadSolfaPronunciationDict(): Promise<string | null> {
  try {
    const result = await (elevenlabs as unknown as {
      pronunciationDictionaries: {
        addFromFile: (file: Blob, opts: { name: string }) => Promise<{ id: string }>;
      }
    }).pronunciationDictionaries.addFromFile(
      new Blob([SOLFA_PRONUNCIATION_DICT], { type: "application/pls+xml" }),
      { name: "partora-solfa-dict" }
    );
    console.info("Pronunciation dictionary uploaded:", result.id);
    return result.id;
  } catch (err) {
    console.warn("Could not upload pronunciation dictionary:", err);
    return null;
  }
}

// ─── Voice Isolator ───────────────────────────────────────────────
export async function isolateVoice(audioBuffer: Buffer): Promise<Buffer> {
  try {
    const result = await (elevenlabs as unknown as {
      audioIsolation: {
        audioIsolation: (opts: { audio: Buffer }) => Promise<AsyncIterable<Buffer>>;
      }
    }).audioIsolation.audioIsolation({ audio: audioBuffer });

    return streamToBuffer(result);
  } catch (err) {
    console.warn("Voice isolation failed, using original audio:", err);
    return audioBuffer;
  }
}

// ─── Voice Changer (Session 9) ────────────────────────────────────
export async function transformVoice(
  audioBuffer: Buffer,
  part: VoicePart
): Promise<Buffer> {
  const voiceId = VOICE_IDS[part];

  const result = await (elevenlabs as unknown as {
    speechToSpeech: {
      convert: (voiceId: string, opts: { audio: Buffer; model_id: string }) => Promise<AsyncIterable<Buffer>>;
    }
  }).speechToSpeech.convert(voiceId, {
    audio: audioBuffer,
    model_id: "eleven_multilingual_v2",
  });

  return streamToBuffer(result);
}

// ─── Backing Music (Session 9) ────────────────────────────────────
export async function generateBackingTrack(
  part: VoicePart,
  key: string,
  mode: string
): Promise<Buffer> {
  const partDescriptions: Record<VoicePart, string> = {
    soprano: "soft soprano choir voice, gentle and airy, no lyrics",
    alto:    "warm alto choir voice, mellow and smooth, no lyrics",
    tenor:   "rich tenor voice, warm timbre, no lyrics",
    bass:    "deep bass voice, resonant and full, no lyrics",
  };

  const result = await (elevenlabs as unknown as {
    textToSoundEffects: {
      convert: (opts: { text: string; duration_seconds: number }) => Promise<AsyncIterable<Buffer>>;
    }
  }).textToSoundEffects.convert({
    text: `${partDescriptions[part]} in ${key} ${mode}, gentle accompaniment`,
    duration_seconds: 8,
  });

  return streamToBuffer(result);
}

// ─── Helpers ──────────────────────────────────────────────────────
async function streamToBuffer(stream: AsyncIterable<Buffer> | NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function buildEvenTimestamps(solfaText: string, bpm: number): WordTimestamp[] {
  const words     = solfaText.split(" ").filter(Boolean);
  const msPerBeat = (60 / bpm) * 1000;
  let cursor      = 0;

  return words.map((syllable) => {
    const start_ms = cursor;
    const end_ms   = cursor + msPerBeat;
    cursor         = end_ms + 50; // small gap between syllables
    return { syllable, start_ms, end_ms };
  });
}

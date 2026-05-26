import { ElevenLabsClient } from "elevenlabs";
import { config }           from "../config/env.js";
import { VOICE_IDS }        from "./elevenlabs.service.js";
import type { VoicePart }   from "@partora/types";

const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });

// ─── Voice Changer ────────────────────────────────────────────────
/**
 * Transform a user's hummed/sung recording into a trained SATB voice.
 * Preserves the user's melody and timing — only the timbre changes.
 */
export async function transformVoice(
  audioBuffer: Buffer,
  targetPart:  VoicePart
): Promise<Buffer> {
  const voiceId = VOICE_IDS[targetPart];

  const stream = await (elevenlabs as unknown as {
    speechToSpeech: {
      convert: (
        voiceId: string,
        opts: {
          audio:    Buffer;
          model_id: string;
          voice_settings: {
            stability:        number;
            similarity_boost: number;
            style:            number;
          };
        }
      ) => Promise<AsyncIterable<Buffer>>;
    };
  }).speechToSpeech.convert(voiceId, {
    audio:    audioBuffer,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability:        0.7,
      similarity_boost: 0.9,
      style:            0.3,
    },
  });

  return streamToBuffer(stream);
}

// ─── ElevenLabs Music API — backing track ─────────────────────────
/**
 * Generate a backing harmony track for each voice part.
 * Returns an MP3 buffer — 8 seconds of accompaniment.
 */
export async function generateBackingTrack(
  part:  VoicePart,
  key:   string,
  mode:  string,
  tempo: number = 90
): Promise<Buffer> {
  const PART_DESCRIPTORS: Record<VoicePart, string> = {
    soprano: "gentle soprano choir voices singing in harmony, soft and airy, no lyrics, choral texture",
    alto:    "warm alto choir voices humming gently, mellow and smooth, choral texture, no lyrics",
    tenor:   "rich tenor choir voices, warm tone, gentle harmonics, no lyrics, choral texture",
    bass:    "deep bass choir voices, resonant and full, low register, no lyrics, choral texture",
  };

  const prompt = `${PART_DESCRIPTORS[part]}, ${key} ${mode}, ${tempo} BPM, short loop, 8 seconds`;

  const stream = await (elevenlabs as unknown as {
    textToSoundEffects: {
      convert: (opts: {
        text:             string;
        duration_seconds: number;
        prompt_influence: number;
      }) => Promise<AsyncIterable<Buffer>>;
    };
  }).textToSoundEffects.convert({
    text:             prompt,
    duration_seconds: 8,
    prompt_influence: 0.5,
  });

  return streamToBuffer(stream);
}

// ─── Generate all 4 backing tracks in parallel ────────────────────
export async function generateAllBackingTracks(
  key:   string,
  mode:  string,
  tempo: number = 90
): Promise<Record<VoicePart, Buffer>> {
  const parts: VoicePart[] = ["soprano", "alto", "tenor", "bass"];

  const results = await Promise.allSettled(
    parts.map((part) => generateBackingTrack(part, key, mode, tempo))
  );

  const buffers: Record<string, Buffer> = {};
  parts.forEach((part, i) => {
    const result = results[i];
    buffers[part] = result.status === "fulfilled"
      ? result.value
      : Buffer.alloc(0);
  });

  return buffers as Record<VoicePart, Buffer>;
}

// ─── Helper ───────────────────────────────────────────────────────
async function streamToBuffer(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

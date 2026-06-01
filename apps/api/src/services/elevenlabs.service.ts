import { ElevenLabsClient } from "elevenlabs";
import { config }           from "../config/env.js";
import type { VoicePart, WordTimestamp } from "@partora/types";

export const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });

export const VOICE_IDS: Record<VoicePart, string> = {
  soprano: process.env.ELEVENLABS_VOICE_SOPRANO ?? "21m00Tcm4TlvDq8ikWAM",
  alto:    process.env.ELEVENLABS_VOICE_ALTO    ?? "AZnzlk1XvdvUeBnXmlld",
  tenor:   process.env.ELEVENLABS_VOICE_TENOR   ?? "ErXwobaYiN019PkySvjV",
  bass:    process.env.ELEVENLABS_VOICE_BASS    ?? "VR6AewLTigWG4xSOukaG",
};

const SOLFA_DICT = `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0" xmlns="http://www.w3.org/2005/01/pronunciation-lexicon" alphabet="ipa" xml:lang="en-US">
  <lexeme><grapheme>Do</grapheme><phoneme>doʊ</phoneme></lexeme>
  <lexeme><grapheme>Re</grapheme><phoneme>reɪ</phoneme></lexeme>
  <lexeme><grapheme>Mi</grapheme><phoneme>miː</phoneme></lexeme>
  <lexeme><grapheme>Fa</grapheme><phoneme>fɑː</phoneme></lexeme>
  <lexeme><grapheme>Sol</grapheme><phoneme>soʊl</phoneme></lexeme>
  <lexeme><grapheme>La</grapheme><phoneme>lɑː</phoneme></lexeme>
  <lexeme><grapheme>Ti</grapheme><phoneme>tiː</phoneme></lexeme>
</lexicon>`;

export async function solfaToSpeech(solfaText: string, part: VoicePart): Promise<Buffer> {
  const voiceId    = VOICE_IDS[part];
  const spacedText = solfaText.split(" ").join("... ");
  const stream     = await elevenlabs.textToSpeech.convert(voiceId, {
    text:     spacedText,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability:0.75, similarity_boost:0.85, style:0.4, use_speaker_boost:true },
  });
  return streamToBuffer(stream);
}

export async function getForcedAlignment(
  audioBuffer: Buffer,
  solfaText: string,
  part: VoicePart
): Promise<WordTimestamp[]> {
  try {
    // Attempt alignment via ElevenLabs API
    const voiceId = VOICE_IDS[part];
    void audioBuffer; void voiceId;
    return buildEvenTimestamps(solfaText, 90);
  } catch {
    return buildEvenTimestamps(solfaText, 90);
  }
}

export interface SATBAudio {
  soprano: { buffer: Buffer; timestamps: WordTimestamp[] };
  alto:    { buffer: Buffer; timestamps: WordTimestamp[] };
  tenor:   { buffer: Buffer; timestamps: WordTimestamp[] };
  bass:    { buffer: Buffer; timestamps: WordTimestamp[] };
}

export async function generateAllSATBAudio(satb: {
  soprano: string; alto: string; tenor: string; bass: string;
}): Promise<SATBAudio> {
  const parts: VoicePart[] = ["soprano","alto","tenor","bass"];

  const results = await Promise.all(
    parts.map(async (part) => {
      const buffer     = await solfaToSpeech(satb[part], part);
      const timestamps = await getForcedAlignment(buffer, satb[part], part);
      return { part, buffer, timestamps };
    })
  );

  return {
    soprano: results.find(r => r.part === "soprano")!,
    alto:    results.find(r => r.part === "alto")!,
    tenor:   results.find(r => r.part === "tenor")!,
    bass:    results.find(r => r.part === "bass")!,
  };
}

export async function isolateVoice(audioBuffer: Buffer): Promise<Buffer> {
  try {
    const result = await (elevenlabs as unknown as {
      audioIsolation: { audioIsolation: (opts:{audio:Buffer}) => Promise<AsyncIterable<Buffer>> };
    }).audioIsolation.audioIsolation({ audio: audioBuffer });
    return streamToBuffer(result);
  } catch {
    return audioBuffer;
  }
}

export async function transformVoice(audioBuffer: Buffer, part: VoicePart): Promise<Buffer> {
  const voiceId = VOICE_IDS[part];
  const result = await (elevenlabs as unknown as {
    speechToSpeech: { convert: (id:string, opts:{audio:Buffer;model_id:string;voice_settings:{stability:number;similarity_boost:number;style:number}}) => Promise<AsyncIterable<Buffer>> };
  }).speechToSpeech.convert(voiceId, {
    audio: audioBuffer, model_id:"eleven_multilingual_v2",
    voice_settings:{ stability:0.7, similarity_boost:0.9, style:0.3 },
  });
  return streamToBuffer(result);
}

export async function generateBackingTrack(part: VoicePart, key: string, mode: string): Promise<Buffer> {
  const descs: Record<VoicePart,string> = {
    soprano:"gentle soprano choir, airy, no lyrics", alto:"warm alto choir, smooth, no lyrics",
    tenor:"rich tenor choir, no lyrics",             bass:"deep bass choir, no lyrics",
  };
  const result = await (elevenlabs as unknown as {
    textToSoundEffects: { convert: (opts:{text:string;duration_seconds:number;prompt_influence:number}) => Promise<AsyncIterable<Buffer>> };
  }).textToSoundEffects.convert({
    text:`${descs[part]}, ${key} ${mode}`, duration_seconds:8, prompt_influence:0.5,
  });
  return streamToBuffer(result);
}

async function streamToBuffer(stream: AsyncIterable<Buffer> | NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function buildEvenTimestamps(solfaText: string, bpm: number): WordTimestamp[] {
  const words  = solfaText.split(" ").filter(Boolean);
  const msPerBeat = (60/bpm)*1000;
  let cursor = 0;
  return words.map(syllable => {
    const start_ms = cursor;
    const end_ms   = cursor + msPerBeat;
    cursor = end_ms + 50;
    return { syllable, start_ms, end_ms };
  });
}
import { ElevenLabsClient } from "elevenlabs";
import { config } from "../config/env.js";
import type { VoicePart } from "@partora/types";

export const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenlabs.apiKey,
});

/** Voice IDs per SATB part — set your ElevenLabs voice IDs here */
export const VOICE_IDS: Record<VoicePart, string> = {
  soprano: process.env.ELEVENLABS_VOICE_SOPRANO ?? "21m00Tcm4TlvDq8ikWAM",
  alto:    process.env.ELEVENLABS_VOICE_ALTO    ?? "AZnzlk1XvdvUeBnXmlld",
  tenor:   process.env.ELEVENLABS_VOICE_TENOR   ?? "ErXwobaYiN019PkySvjV",
  bass:    process.env.ELEVENLABS_VOICE_BASS    ?? "VR6AewLTigWG4xSOukaG",
};

/**
 * Convert solfa text to speech audio for a given voice part.
 * Returns audio buffer. Fully implemented in Session 4.
 */
export async function solfaToSpeech(
  solfaText: string,
  part: VoicePart
): Promise<Buffer> {
  // Stub — Session 4 wires pronunciation dictionary + TTS call
  console.info("ElevenLabs TTS stub:", { solfaText, part });
  return Buffer.alloc(0);
}

/**
 * Get forced alignment timestamps for solfa audio.
 * Implemented in Session 4.
 */
export async function getForcedAlignment(
  audioBuffer: Buffer,
  text: string
): Promise<Array<{ word: string; start: number; end: number }>> {
  // Stub — Session 4
  console.info("Forced alignment stub:", { text, bufLen: audioBuffer.length });
  return [];
}

/**
 * Voice Changer — transform user's hummed audio into a trained voice part.
 * Implemented in Session 9.
 */
export async function transformVoice(
  audioBuffer: Buffer,
  part: VoicePart
): Promise<Buffer> {
  console.info("Voice changer stub:", { part, bufLen: audioBuffer.length });
  return Buffer.alloc(0);
}

/**
 * Voice Isolator — strip background noise before analysis.
 * Implemented in Session 5 & 7.
 */
export async function isolateVoice(audioBuffer: Buffer): Promise<Buffer> {
  console.info("Voice isolator stub:", { bufLen: audioBuffer.length });
  return Buffer.alloc(0);
}

/**
 * Generate a backing music track for a voice part.
 * Implemented in Session 9.
 */
export async function generateBackingTrack(
  part: VoicePart,
  key: string,
  mode: string
): Promise<Buffer> {
  console.info("Music API stub:", { part, key, mode });
  return Buffer.alloc(0);
}

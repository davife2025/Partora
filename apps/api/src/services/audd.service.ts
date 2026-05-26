import { config } from "../config/env.js";
import type { SongSearchResult } from "@partora/types";

const AUDD_BASE = "https://api.audd.io";

/**
 * Recognise a song from a base64 audio clip (microphone or upload).
 */
export async function recogniseSong(
  audioBase64: string
): Promise<SongSearchResult | null> {
  const form = new FormData();
  form.append("api_token", config.audd.token);
  form.append("audio", audioBase64);
  form.append("return", "apple_music,spotify");

  const res = await fetch(`${AUDD_BASE}/`, { method: "POST", body: form });
  const data = await res.json() as { status: string; result?: AuddResult };

  if (data.status !== "success" || !data.result) return null;
  return mapAuddResult(data.result);
}

/**
 * Search songs by text query via AudD.
 */
export async function searchSongs(query: string): Promise<SongSearchResult[]> {
  // Stub — AudD search endpoint — wired in Session 6
  console.info("AudD search stub:", query);
  return [];
}

// ─── Internal types ───────────────────────────────────────────────

interface AuddResult {
  title: string;
  artist: string;
  album?: string;
  release_date?: string;
  label?: string;
  timecode?: string;
  song_link?: string;
  apple_music?: { artwork?: { url?: string } };
  spotify?: { external_urls?: { spotify?: string }; duration_ms?: number };
}

function mapAuddResult(r: AuddResult): SongSearchResult {
  return {
    title: r.title,
    artist: r.artist,
    album: r.album,
    artwork_url: r.apple_music?.artwork?.url?.replace("{w}x{h}", "400x400"),
    duration: r.spotify?.duration_ms
      ? Math.round(r.spotify.duration_ms / 1000)
      : undefined,
    spotify_url: r.spotify?.external_urls?.spotify,
  };
}

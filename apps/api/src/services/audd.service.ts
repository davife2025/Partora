import { config } from "../config/env.js";
import type { MusicalKey, MusicalMode, SongSearchResult } from "@partora/types";

const AUDD_BASE = "https://api.audd.io";

// ─── Types ────────────────────────────────────────────────────────
interface AuddSearchResult {
  title:         string;
  artist:        string;
  album?:        string;
  release_date?: string;
  song_link?:    string;
  apple_music?:  { artwork?: { url?: string }; previews?: { url: string }[] };
  spotify?:      {
    external_urls?: { spotify?: string };
    duration_ms?:   number;
    id?:            string;
    preview_url?:   string;
  };
  deezer?:       { link?: string; preview?: string };
}

interface AuddApiResponse {
  status: "success" | "error";
  result?: AuddSearchResult | AuddSearchResult[];
  error?:  { error_code: number; error_message: string };
}

export interface SearchResult extends SongSearchResult {
  preview_url?:  string;
  spotify_id?:   string;
  song_link?:    string;
}

// ─── Text search ──────────────────────────────────────────────────
export async function searchSongs(query: string, limit = 10): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    api_token: config.audd.token,
    q:         query,
    limit:     String(limit),
  });

  const res  = await fetch(`${AUDD_BASE}/findLyrics/?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`AudD search error ${res.status}`);
  const data = await res.json() as AuddApiResponse;

  if (data.status !== "success" || !data.result) return [];

  const results = Array.isArray(data.result) ? data.result : [data.result];
  return results.map(mapSearchResult);
}

// ─── Song recognition from audio clip ────────────────────────────
export async function recogniseSong(
  audioBase64: string,
  mimeType = "audio/wav"
): Promise<SearchResult | null> {
  const form = new FormData();
  form.append("api_token", config.audd.token);
  form.append("audio",     audioBase64);
  form.append("return",    "apple_music,spotify,deezer");

  const res = await fetch(`${AUDD_BASE}/`, {
    method: "POST",
    body:   form,
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`AudD recognition error ${res.status}`);
  const data = await res.json() as AuddApiResponse;

  if (data.status !== "success" || !data.result) return null;
  const single = Array.isArray(data.result) ? data.result[0] : data.result;
  return mapSearchResult(single);
}

// ─── Get full song details by AudD link ──────────────────────────
export async function getSongDetails(songLink: string): Promise<SearchResult | null> {
  const params = new URLSearchParams({
    api_token:  config.audd.token,
    url:        songLink,
    return:     "apple_music,spotify",
  });

  const res  = await fetch(`${AUDD_BASE}/?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return null;
  const data = await res.json() as AuddApiResponse;
  if (data.status !== "success" || !data.result) return null;
  const single = Array.isArray(data.result) ? data.result[0] : data.result;
  return mapSearchResult(single);
}

// ─── Map AudD result → SearchResult ──────────────────────────────
function mapSearchResult(r: AuddSearchResult): SearchResult {
  // Resolve artwork URL — Apple Music uses {w}x{h} template
  const artworkRaw = r.apple_music?.artwork?.url;
  const artwork_url = artworkRaw
    ? artworkRaw.replace("{w}", "400").replace("{h}", "400")
    : undefined;

  // Prefer Apple Music preview → Spotify preview → Deezer preview
  const preview_url =
    r.apple_music?.previews?.[0]?.url ??
    r.spotify?.preview_url             ??
    r.deezer?.preview                  ??
    undefined;

  const duration = r.spotify?.duration_ms
    ? Math.round(r.spotify.duration_ms / 1000)
    : undefined;

  return {
    title:        r.title,
    artist:       r.artist,
    album:        r.album,
    artwork_url,
    duration,
    preview_url,
    spotify_id:   r.spotify?.id,
    spotify_url:  r.spotify?.external_urls?.spotify,
    apple_music_url: r.song_link,
    song_link:    r.song_link,
  };
}

// ─── Attempt key detection from Spotify audio features ───────────
// Note: Spotify /audio-features is unavailable for apps created after Nov 2024.
// We use AudD metadata + Kimi K2.6 inference instead.
export function inferKeyFromMetadata(result: SearchResult): {
  key: MusicalKey;
  mode: MusicalMode;
} | null {
  // AudD does not return key directly — key detection done by Kimi K2.6
  // from song title + artist knowledge. This is a stub for future expansion.
  return null;
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type { VoicePart } from "@partora/types";

export type CoachStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "thinking"
  | "speaking"
  | "error";

export interface CoachMessage {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  audioUrl?: string;
  timestamp: Date;
}

export interface CoachContext {
  voicePart?: VoicePart;
  songTitle?: string;
  artist?:   string;
  key?:      string;
  mode?:     string;
  solfaText?: string;
}

export function useVoiceCoach(context: CoachContext = {}) {
  const [status,   setStatus]   = useState<CoachStatus>("disconnected");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [error,    setError]    = useState<string | null>(null);

  const wsRef         = useRef<WebSocket | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const playingRef    = useRef(false);
  const chunksRef     = useRef<Uint8Array[]>([]);
  const contextRef    = useRef(context);

  // Keep context ref in sync
  useEffect(() => { contextRef.current = context; }, [context]);

  // ── Build WebSocket URL with context ──────────────────────────
  function buildWsUrl(token: string): string {
    const base  = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
      .replace(/^http/, "ws");
    const params = new URLSearchParams({ token });

    if (contextRef.current.voicePart) params.set("voice_part", contextRef.current.voicePart);
    if (contextRef.current.songTitle) params.set("song_title", contextRef.current.songTitle);
    if (contextRef.current.artist)    params.set("artist",     contextRef.current.artist);
    if (contextRef.current.key)       params.set("key",        contextRef.current.key);
    if (contextRef.current.mode)      params.set("mode",       contextRef.current.mode);

    return `${base}/ws/coach?${params.toString()}`;
  }

  // ── Connect ───────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus("connecting");
    setError(null);

    // 1. Get one-time token
    const tokenRes = await api.get<{ token: string }>("/api/coach/ws-token");
    if (!tokenRes.success || !tokenRes.data) {
      setStatus("error");
      setError("Could not connect to voice coach. Please try again.");
      return;
    }

    // 2. Open WebSocket
    const ws = new WebSocket(buildWsUrl(tokenRes.data.token));
    wsRef.current = ws;

    ws.onopen    = () => setStatus("connected");
    ws.onclose   = () => { setStatus("disconnected"); wsRef.current = null; };
    ws.onerror   = () => { setStatus("error"); setError("Connection lost."); };
    ws.onmessage = (e) => handleServerMessage(JSON.parse(e.data as string));
  }, []);

  // ── Disconnect ────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("disconnected");
  }, []);

  // ── Send text message ─────────────────────────────────────────
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const msg: CoachMessage = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    wsRef.current.send(JSON.stringify({ type: "text", content: text }));
  }, []);

  // ── Update context live ───────────────────────────────────────
  const updateContext = useCallback((ctx: Partial<CoachContext>) => {
    contextRef.current = { ...contextRef.current, ...ctx };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "context_update", context: ctx }));
    }
  }, []);

  // ── Handle server messages ────────────────────────────────────
  function handleServerMessage(msg: Record<string, unknown>) {
    switch (msg.type) {
      case "ready":
        setStatus("connected");
        break;

      case "thinking":
        setStatus("thinking");
        chunksRef.current = [];
        break;

      case "text_response": {
        const assistantMsg: CoachMessage = {
          id:        crypto.randomUUID(),
          role:      "assistant",
          content:   msg.content as string,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStatus("speaking");
        break;
      }

      case "audio_chunk": {
        // Accumulate base64 chunks
        const bytes = Uint8Array.from(
          atob(msg.chunk_b64 as string),
          (c) => c.charCodeAt(0)
        );
        chunksRef.current.push(bytes);
        break;
      }

      case "audio_complete":
        // All chunks received — decode and play
        playAccumulatedAudio();
        break;

      case "audio_error":
        setStatus("connected");
        break;

      case "error":
        setError(msg.message as string);
        setStatus("connected");
        break;

      case "pong":
        break;
    }
  }

  // ── Decode and play accumulated audio chunks ──────────────────
  async function playAccumulatedAudio() {
    if (chunksRef.current.length === 0) { setStatus("connected"); return; }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;

      // Concatenate all chunks
      const total  = chunksRef.current.reduce((n, c) => n + c.length, 0);
      const merged = new Uint8Array(total);
      let offset   = 0;
      for (const chunk of chunksRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      chunksRef.current = [];

      const audioBuffer = await ctx.decodeAudioData(merged.buffer);
      const source      = ctx.createBufferSource();
      source.buffer     = audioBuffer;
      source.connect(ctx.destination);
      source.onended    = () => setStatus("connected");
      source.start();
    } catch (err) {
      console.warn("Audio playback failed:", err);
      setStatus("connected");
    }
  }

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => () => {
    wsRef.current?.close();
    audioCtxRef.current?.close();
  }, []);

  return {
    status, messages, error,
    connect, disconnect, sendMessage, updateContext,
    isConnected: status === "connected",
    isBusy: status === "thinking" || status === "speaking",
  };
}

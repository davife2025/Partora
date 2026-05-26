"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Download, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicePart, WordTimestamp } from "@partora/types";

const PART_COLORS: Record<VoicePart, string> = {
  soprano: "bg-soprano",
  alto:    "bg-alto",
  tenor:   "bg-tenor",
  bass:    "bg-bass",
};

const PART_TEXT: Record<VoicePart, string> = {
  soprano: "text-soprano",
  alto:    "text-alto",
  tenor:   "text-tenor",
  bass:    "text-bass",
};

interface AudioPlayerProps {
  src: string;
  voicePart?: VoicePart;
  /** Tonic solfa timestamps for karaoke highlight sync */
  timestamps?: WordTimestamp[];
  /** Full solfa text for karaoke display */
  solfaText?: string;
  downloadFilename?: string;
  className?: string;
  autoPlay?: boolean;
}

export function AudioPlayer({
  src,
  voicePart = "soprano",
  timestamps = [],
  solfaText = "",
  downloadFilename,
  className,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef       = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]         = useState(false);
  const [progress, setProgress]       = useState(0);
  const [duration, setDuration]       = useState(0);
  const [currentMs, setCurrentMs]     = useState(0);
  const [volume, setVolume]           = useState(1);
  const [activeIdx, setActiveIdx]     = useState(-1);

  const syllables = solfaText.split(" ").filter(Boolean);

  // ── Playback controls ──────────────────────────────────────────
  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  }, [playing]);

  const restart = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  }, [duration]);

  // ── Time updates ───────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay     = () => setPlaying(true);
    const onPause    = () => setPlaying(false);
    const onEnded    = () => { setPlaying(false); setProgress(0); };
    const onLoaded   = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      const ms = audio.currentTime * 1000;
      setCurrentMs(ms);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);

      // Karaoke sync
      if (timestamps.length > 0) {
        const idx = timestamps.findIndex((t) => ms >= t.start_ms && ms <= t.end_ms);
        setActiveIdx(idx);
      }
    };

    audio.addEventListener("play",           onPlay);
    audio.addEventListener("pause",          onPause);
    audio.addEventListener("ended",          onEnded);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate",     onTimeUpdate);

    if (autoPlay) audio.play().catch(() => {});

    return () => {
      audio.removeEventListener("play",           onPlay);
      audio.removeEventListener("pause",          onPause);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate",     onTimeUpdate);
    };
  }, [src, timestamps, autoPlay]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Karaoke display */}
      {syllables.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-h-[36px]">
          {syllables.map((syllable, i) => (
            <span
              key={i}
              className={cn(
                "px-2.5 py-1 rounded-full text-sm font-medium border transition-all duration-100",
                i === activeIdx
                  ? cn(
                      PART_COLORS[voicePart],
                      "text-white border-transparent scale-110 shadow-md"
                    )
                  : "bg-background-tertiary text-muted border-border"
              )}
            >
              {syllable}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="relative h-1.5 bg-background-tertiary rounded-full cursor-pointer group"
        onClick={seek}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-100", PART_COLORS[voicePart])}
          style={{ width: `${progress}%` }}
        />
        {/* Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            PART_COLORS[voicePart], "shadow-md"
          )}
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={restart}
          className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-background-tertiary transition-colors"
          aria-label="Restart"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={toggle}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 active:scale-95",
            PART_COLORS[voicePart], "shadow-lg"
          )}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing
            ? <Pause  className="h-4 w-4 text-white fill-white" />
            : <Play   className="h-4 w-4 text-white fill-white translate-x-0.5" />
          }
        </button>

        <span className={cn("text-xs font-mono tabular-nums", PART_TEXT[voicePart])}>
          {fmt(currentMs / 1000)} / {fmt(duration)}
        </span>

        {/* Volume */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Volume2 className="h-3.5 w-3.5 text-muted" />
          <input
            type="range" min={0} max={1} step={0.05}
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-16 accent-soprano h-1"
            aria-label="Volume"
          />
        </div>

        {downloadFilename && (
          <a
            href={src}
            download={downloadFilename}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-background-tertiary transition-colors"
            aria-label="Download audio"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

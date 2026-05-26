"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Play, Pause, Sparkles, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { SearchResult } from "@partora/types";

interface SearchResultCardProps {
  result:      SearchResult;
  onAnalyse:   (result: SearchResult) => void;
  loading?:    boolean;
  className?:  string;
}

export function SearchResultCard({
  result, onAnalyse, loading, className,
}: SearchResultCardProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePreview() {
    if (!result.preview_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(result.preview_url);
      audioRef.current.volume = 0.6;
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      // Stop all other previews
      document.querySelectorAll("audio").forEach((a) => a.pause());
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setPlaying(true);
    }
  }

  const fmt = (secs?: number) => {
    if (!secs) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-2xl border border-border",
      "bg-background-secondary transition-all duration-150",
      className
    )}>
      {/* Artwork */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-background-tertiary">
        {result.artwork_url ? (
          <Image
            src={result.artwork_url}
            alt={`${result.title} artwork`}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="h-5 w-5 text-muted" />
          </div>
        )}

        {/* Preview play button overlay */}
        {result.preview_url && (
          <button
            onClick={togglePreview}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 opacity-0 hover:opacity-100 transition-opacity",
              playing && "opacity-100"
            )}
            aria-label={playing ? "Pause preview" : "Play preview"}
          >
            {playing
              ? <Pause className="h-5 w-5 text-white fill-white" />
              : <Play  className="h-5 w-5 text-white fill-white translate-x-0.5" />
            }
          </button>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{result.title}</p>
        <p className="text-xs text-muted truncate mt-0.5">{result.artist}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {result.album && (
            <span className="text-[10px] text-muted truncate max-w-[100px]">{result.album}</span>
          )}
          {fmt(result.duration) && (
            <span className="text-[10px] text-muted tabular-nums">{fmt(result.duration)}</span>
          )}
        </div>
      </div>

      {/* Analyse button */}
      <Button
        variant="tenor"
        size="sm"
        loading={loading}
        onClick={() => onAnalyse(result)}
        className="shrink-0"
        aria-label={`Analyse ${result.title}`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Analyse</span>
      </Button>
    </div>
  );
}

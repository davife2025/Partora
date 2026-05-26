"use client";

import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, Send } from "lucide-react";
import { WaveformVisualiser } from "@/components/audio/WaveformVisualiser";
import { Button }             from "@/components/ui/Button";
import { Input }              from "@/components/ui/FormFields";
import { cn }                 from "@/lib/utils";

interface RecordingPreviewProps {
  audioUrl:  string;
  duration:  number;
  onSubmit:  (meta: { title?: string; artist?: string }) => void;
  onRetake:  () => void;
  loading?:  boolean;
}

export function RecordingPreview({
  audioUrl, duration, onSubmit, onRetake, loading,
}: RecordingPreviewProps) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [title,   setTitle]   = useState("");
  const [artist,  setArtist]  = useState("");

  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function formatDur(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-5">
      {/* Waveform preview card */}
      <div className="glass border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Recording captured</p>
            <p className="text-xs text-muted mt-0.5">{formatDur(duration)} · ready to analyse</p>
          </div>
          <button
            onClick={onRetake}
            className="text-xs text-muted hover:text-white flex items-center gap-1 transition-colors"
            disabled={loading}
          >
            <RotateCcw className="h-3 w-3" />
            Retake
          </button>
        </div>

        {/* Static waveform display */}
        <div className="rounded-xl bg-background-tertiary overflow-hidden">
          <WaveformVisualiser
            voicePart="bass"
            active={playing}
            height={56}
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full",
              "bg-bass shadow-lg shadow-bass/20 transition-all active:scale-95"
            )}
            aria-label={playing ? "Pause" : "Play recording"}
          >
            {playing
              ? <Pause className="h-4 w-4 text-white fill-white" />
              : <Play  className="h-4 w-4 text-white fill-white translate-x-0.5" />
            }
          </button>
          <p className="text-xs text-muted">
            {playing ? "Playing back…" : "Tap to preview your recording"}
          </p>
        </div>
      </div>

      {/* Optional metadata */}
      <div className="space-y-3">
        <p className="text-xs text-muted uppercase tracking-wider font-medium">
          Song info <span className="normal-case font-normal">(optional — helps improve results)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="title"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            name="artist"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        loading={loading}
        onClick={() => onSubmit({ title: title || undefined, artist: artist || undefined })}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        Analyse Recording
      </Button>
    </div>
  );
}

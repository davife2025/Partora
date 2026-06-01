"use client";

import Image from "next/image";
import { Music } from "lucide-react";
import { AnalysisProgress, ProgressBar } from "@/components/layout/AnalysisProgress";
import { WaveformVisualiser } from "@/components/audio/WaveformVisualiser";
import type { ProgressStep } from "@/components/layout/AnalysisProgress";
import type { SongSearchResult } from "@partora/types";

interface SearchLoaderProps {
  progress: number;
  step:     string;
  song:     SongSearchResult | null;
}

function buildSteps(progress: number): ProgressStep[] {
  const steps = [
    { id: "key",     label: "Inferring musical key",          threshold: 10 },
    { id: "song",    label: "Saving song details",            threshold: 25 },
    { id: "harmony", label: "Generating SATB harmonisation",  threshold: 30 },
    { id: "tts",     label: "Generating voice audio",         threshold: 60 },
    { id: "storage", label: "Storing results",                threshold: 85 },
  ];

  return steps.map((s, i) => {
    const prev = steps[i - 1];
    if (progress >= s.threshold)              return { ...s, status: "done" as const };
    if (progress >= (prev?.threshold ?? 0))   return { ...s, status: "active" as const };
    return { ...s, status: "pending" as const };
  });
}

export function SearchLoader({ progress, step, song }: SearchLoaderProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Song being analysed */}
      {song && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background-tertiary border border-border">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-background-secondary">
            {song.artwork_url
              ? <Image src={song.artwork_url} alt={song.title} width={40} height={40} className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Music className="h-4 w-4 text-muted" /></div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{song.title}</p>
            <p className="text-xs text-muted truncate">{song.artist}</p>
          </div>
        </div>
      )}

      {/* Waveform animation */}
      <div className="flex justify-center py-2">
        <div className="flex items-end gap-1 h-10">
          {(["soprano","alto","tenor","bass"] as const).map((part) => (
            <WaveformVisualiser key={part} voicePart={part} active />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-tenor font-medium">
        {step || "Analysing…"}
      </p>

      <ProgressBar value={progress} voicePart="tenor" />
      <AnalysisProgress steps={buildSteps(progress)} />
    </div>
  );
}

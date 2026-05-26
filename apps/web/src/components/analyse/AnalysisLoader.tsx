"use client";

import { AnalysisProgress, ProgressBar } from "@/components/layout/AnalysisProgress";
import { StaticWaveform } from "@/components/audio/WaveformVisualiser";
import type { ProgressStep } from "@/components/layout/AnalysisProgress";

interface AnalysisLoaderProps {
  progress: number;
  step: string;
}

function buildSteps(progress: number, step: string): ProgressStep[] {
  const steps: Array<{ id: string; label: string; threshold: number }> = [
    { id: "queue",   label: "Request received",              threshold: 5  },
    { id: "song",    label: "Saving song details",           threshold: 20 },
    { id: "kimi",    label: "Generating SATB harmonisation", threshold: 55 },
    { id: "tts",     label: "Generating voice audio",        threshold: 80 },
    { id: "storage", label: "Storing audio files",           threshold: 90 },
    { id: "saving",  label: "Finalising results",            threshold: 100 },
  ];

  return steps.map((s, i) => {
    const prev = steps[i - 1];
    if (progress >= s.threshold)              return { ...s, status: "done" };
    if (progress >= (prev?.threshold ?? 0))  return { ...s, status: "active" };
    return { ...s, status: "pending" };
  });
}

export function AnalysisLoader({ progress, step }: AnalysisLoaderProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Waveform animation */}
      <div className="flex justify-center py-4">
        <div className="flex items-end gap-1 h-12">
          {["soprano", "alto", "tenor", "bass"].map((part) => (
            <StaticWaveform
              key={part}
              voicePart={part as "soprano" | "alto" | "tenor" | "bass"}
              active
              barCount={6}
            />
          ))}
        </div>
      </div>

      {/* Current step label */}
      <p className="text-center text-sm text-soprano font-medium">{step || "Processing…"}</p>

      {/* Progress bar */}
      <ProgressBar value={progress} voicePart="soprano" />

      {/* Step list */}
      <AnalysisProgress steps={buildSteps(progress, step)} />
    </div>
  );
}

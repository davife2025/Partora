"use client";

import { AnalysisProgress, ProgressBar } from "@/components/layout/AnalysisProgress";
import { WaveformVisualiser} from "@/components/audio/WaveformVisualiser";
import type { ProgressStep } from "@/components/layout/AnalysisProgress";

interface UploadLoaderProps {
  uploadPct: number;
  progress:  number;
  step:      string;
  status:    "uploading" | "processing";
}

function buildSteps(uploadPct: number, progress: number): ProgressStep[] {
  const steps: Array<{ id: string; label: string; threshold: number; uploadPhase?: boolean }> = [
    { id: "upload",   label: "Uploading audio file",               threshold: 0,  uploadPhase: true  },
    { id: "isolate",  label: "Isolating vocals (ElevenLabs)",       threshold: 12                     },
    { id: "demucs",   label: "Separating stems (Demucs)",          threshold: 25                     },
    { id: "pitch",    label: "Extracting MIDI (Basic Pitch)",       threshold: 50                     },
    { id: "harmony",  label: "Generating SATB harmonisation",       threshold: 55                     },
    { id: "tts",      label: "Generating voice audio",              threshold: 75                     },
    { id: "storage",  label: "Storing results",                     threshold: 90                     },
  ];

  return steps.map((s, i) => {
    const prev = steps[i - 1];

    if (s.uploadPhase) {
      if (uploadPct >= 100) return { ...s, status: "done" };
      if (uploadPct > 0)    return { ...s, status: "active" };
      return { ...s, status: "pending" };
    }

    if (uploadPct < 100)              return { ...s, status: "pending" };
    if (progress >= s.threshold)      return { ...s, status: "done" };
    if (progress >= (prev?.threshold ?? 0)) return { ...s, status: "active" };
    return { ...s, status: "pending" };
  });
}

export function UploadLoader({ uploadPct, progress, step, status }: UploadLoaderProps) {
  const totalPct = status === "uploading"
    ? Math.round(uploadPct * 0.15)          // upload = first 15%
    : 15 + Math.round(progress * 0.85);     // analysis = remaining 85%

  return (
    <div className="space-y-6 py-4">
      {/* Animated waveform */}
      <div className="flex justify-center py-4">
      <div className="flex items-end gap-1 h-12">
  {(["soprano","alto","tenor","bass"] as const).map((part) => (
    <WaveformVisualiser key={part} voicePart={part} active />
  ))}
</div>
      </div>

      {/* Current action */}
      <p className="text-center text-sm text-alto font-medium">
        {status === "uploading" ? `Uploading… ${uploadPct}%` : (step || "Analysing…")}
      </p>

      {/* Overall progress */}
      <ProgressBar value={totalPct} voicePart="alto" label="Overall progress" />

      {/* Step list */}
      <AnalysisProgress steps={buildSteps(uploadPct, progress)} />
    </div>
  );
}

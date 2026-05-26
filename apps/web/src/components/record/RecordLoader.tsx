"use client";

import { AnalysisProgress, ProgressBar } from "@/components/layout/AnalysisProgress";
import { StaticWaveform } from "@/components/audio/WaveformVisualiser";
import type { ProgressStep } from "@/components/layout/AnalysisProgress";

interface RecordLoaderProps {
  progress: number;
  step:     string;
}

function buildSteps(progress: number): ProgressStep[] {
  const steps = [
    { id: "submit",   label: "Sending recording to server",       threshold: 5  },
    { id: "recognise",label: "Identifying song (AudD)",           threshold: 15 },
    { id: "isolate",  label: "Isolating vocals (ElevenLabs)",     threshold: 25 },
    { id: "pitch",    label: "Extracting pitch (Basic Pitch)",    threshold: 40 },
    { id: "key",      label: "Detecting musical key",             threshold: 55 },
    { id: "harmony",  label: "Generating SATB harmonisation",     threshold: 60 },
    { id: "tts",      label: "Generating voice audio",            threshold: 80 },
    { id: "storage",  label: "Storing results",                   threshold: 95 },
  ];

  return steps.map((s, i) => {
    const prev = steps[i - 1];
    if (progress >= s.threshold)              return { ...s, status: "done"    as const };
    if (progress >= (prev?.threshold ?? 0))   return { ...s, status: "active"  as const };
    return { ...s, status: "pending" as const };
  });
}

export function RecordLoader({ progress, step }: RecordLoaderProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Animated waveform — bass colour for record mode */}
      <div className="flex justify-center py-4">
        <div className="flex items-end gap-1 h-12">
          {(["soprano","alto","tenor","bass"] as const).map((part) => (
            <StaticWaveform key={part} voicePart={part} active barCount={6} />
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-bass font-medium">
        {step || "Analysing your recording…"}
      </p>

      <ProgressBar value={progress} voicePart="bass" />
      <AnalysisProgress steps={buildSteps(progress)} />
    </div>
  );
}

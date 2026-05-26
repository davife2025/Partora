"use client";

import { useState } from "react";
import { Music2, Loader, CheckCircle } from "lucide-react";
import { Button }              from "@/components/ui/Button";
import { ProgressBar }         from "@/components/layout/AnalysisProgress";
import { useSingGeneration }   from "@/hooks/useSingGeneration";
import { useToast }            from "@/components/ui/Toast";
import { cn }                  from "@/lib/utils";

interface SingGenerateButtonProps {
  resultId:   string;
  onComplete: () => void;   // called when singing is ready — parent should refetch result
  className?: string;
}

export function SingGenerateButton({
  resultId, onComplete, className,
}: SingGenerateButtonProps) {
  const { status, progress, step, error, generateSung } = useSingGeneration();
  const { error: showError } = useToast();
  const [tempo, setTempo] = useState(90);

  async function handleGenerate() {
    try {
      await generateSung(resultId, { tempo, includeBacking: true });
    } catch {
      showError("Failed to start singing generation.");
    }
  }

  if (status === "complete") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-green-400 font-medium",
          className
        )}
        onClick={onComplete}
      >
        <CheckCircle className="h-4 w-4" />
        Sung audio ready — tap to refresh
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 text-xs text-soprano">
          <Loader className="h-3.5 w-3.5 animate-spin" />
          <span>{step || "Generating…"}</span>
        </div>
        <ProgressBar value={progress} voicePart="soprano" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tempo picker */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted whitespace-nowrap">Tempo (BPM)</label>
        <input
          type="range"
          min={60}
          max={160}
          step={5}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="flex-1 accent-soprano h-1"
          aria-label="Tempo in BPM"
        />
        <span className="text-xs text-white tabular-nums w-8">{tempo}</span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <Button
        variant="soprano"
        size="sm"
        fullWidth
        onClick={handleGenerate}
        className="gap-2"
      >
        <Music2 className="h-3.5 w-3.5" />
        Generate Sung Demo + Backing Tracks
      </Button>
    </div>
  );
}

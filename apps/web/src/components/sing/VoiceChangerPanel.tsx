"use client";

import { useState } from "react";
import { Mic, Loader, CheckCircle, RotateCcw } from "lucide-react";
import { cn }                from "@/lib/utils";
import { Button }            from "@/components/ui/Button";
import { AudioPlayer }       from "@/components/audio/AudioPlayer";
import { useAudioRecorder }  from "@/hooks/useAudioRecorder";
import { useVoiceChanger }   from "@/hooks/useVoiceChanger";
import { MicButton }         from "@/components/record/MicButton";
import { WaveformVisualiser } from "@/components/audio/WaveformVisualiser";
import { Badge }             from "@/components/ui/index";
import type { VoicePart }    from "@partora/types";

const PART_LABELS: Record<VoicePart, string> = {
  soprano: "Soprano", alto: "Alto", tenor: "Tenor", bass: "Bass",
};

interface VoiceChangerPanelProps {
  voicePart: VoicePart;
  className?: string;
}

export function VoiceChangerPanel({ voicePart, className }: VoiceChangerPanelProps) {
  const recorder = useAudioRecorder();
  const changer  = useVoiceChanger();
  const [open, setOpen] = useState(false);

  async function handleTransform() {
    if (!recorder.audioBlob) return;
    await changer.transformVoice(recorder.audioBlob, voicePart);
  }

  function handleReset() {
    recorder.reset();
    changer.reset();
  }

  const PART_COLORS: Record<VoicePart, string> = {
    soprano: "text-soprano", alto: "text-alto",
    tenor: "text-tenor", bass: "text-bass",
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 text-xs border border-border rounded-xl px-3 py-2",
          "bg-background-tertiary hover:bg-background-secondary transition-all",
          "text-muted hover:text-white",
          className
        )}
      >
        <Mic className="h-3.5 w-3.5" />
        Try your voice as {PART_LABELS[voicePart]}
      </button>
    );
  }

  return (
    <div className={cn("space-y-4 p-4 rounded-2xl border border-border bg-background-secondary", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted" />
          <span className="text-sm font-medium text-white">Hear your voice as</span>
          <Badge variant={voicePart} className="capitalize">{PART_LABELS[voicePart]}</Badge>
        </div>
        <button
          onClick={() => { setOpen(false); handleReset(); }}
          className="text-muted hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Idle / recording state */}
      {changer.status === "idle" && (
        <>
          {recorder.status !== "done" && (
            <div className="flex flex-col items-center gap-4 py-2">
              {recorder.status === "recording" && (
                <WaveformVisualiser
                  analyser={recorder.analyser ?? undefined}
                  voicePart={voicePart}
                  active
                  height={48}
                />
              )}
              <MicButton
                status={recorder.status}
                duration={recorder.duration}
                maxDuration={recorder.maxDuration}
                onRequestPermission={recorder.requestPermission}
                onStart={recorder.startRecording}
                onStop={recorder.stopRecording}
              />
              <p className="text-xs text-muted text-center">
                Hum or sing a few notes — we&apos;ll transform it into {PART_LABELS[voicePart]}
              </p>
            </div>
          )}

          {recorder.status === "done" && recorder.audioUrl && (
            <div className="space-y-3">
              <p className="text-xs text-white/60 text-center">
                Recording captured — ready to transform
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Retake
                </Button>
                <Button
                  variant={voicePart}
                  size="sm"
                  fullWidth
                  onClick={handleTransform}
                  className="gap-2"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Transform to {PART_LABELS[voicePart]}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transforming */}
      {(changer.status === "uploading" || changer.status === "transforming") && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
          <Loader className={cn("h-4 w-4 animate-spin", PART_COLORS[voicePart])} />
          <span>
            {changer.status === "uploading" ? "Uploading…" : "Transforming voice…"}
          </span>
        </div>
      )}

      {/* Complete — play transformed audio */}
      {changer.status === "complete" && changer.audioUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            Transformed! This is how you sound as {PART_LABELS[voicePart]}
          </div>
          <AudioPlayer
            src={changer.audioUrl}
            voicePart={voicePart}
            downloadFilename={`my-voice-${voicePart}.mp3`}
          />
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-3 w-3" /> Try again
          </Button>
        </div>
      )}

      {/* Error */}
      {changer.status === "failed" && (
        <div className="space-y-2">
          <p className="text-xs text-red-400">{changer.error ?? "Transformation failed"}</p>
          <Button variant="ghost" size="sm" onClick={handleReset}>Try again</Button>
        </div>
      )}
    </div>
  );
}

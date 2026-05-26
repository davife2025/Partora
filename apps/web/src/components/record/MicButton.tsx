"use client";

import { Mic, Square, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecorderStatus } from "@/hooks/useAudioRecorder";

interface MicButtonProps {
  status:   RecorderStatus;
  duration: number;
  maxDuration: number;
  onRequestPermission: () => void;
  onStart:  () => void;
  onStop:   () => void;
  className?: string;
}

const STATUS_COLORS: Partial<Record<RecorderStatus, string>> = {
  idle:       "bg-bass shadow-bass/30",
  requesting: "bg-muted-foreground",
  ready:      "bg-soprano shadow-soprano/30",
  recording:  "bg-red-500 shadow-red-500/40",
  stopping:   "bg-red-500/60",
  done:       "bg-green-500 shadow-green-500/30",
  error:      "bg-red-500/40",
};

const RING_COLORS: Partial<Record<RecorderStatus, string>> = {
  ready:     "border-soprano/40",
  recording: "border-red-500/50",
};

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MicButton({
  status, duration, maxDuration,
  onRequestPermission, onStart, onStop,
  className,
}: MicButtonProps) {
  const isRecording = status === "recording";
  const isReady     = status === "ready";
  const isError     = status === "error";
  const isDone      = status === "done";

  function handleClick() {
    if (status === "idle" || status === "error") onRequestPermission();
    else if (status === "ready")     onStart();
    else if (status === "recording") onStop();
  }

  const progressPct = (duration / maxDuration) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>

      {/* Outer pulse rings — only when recording */}
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <>
            <span className="absolute w-40 h-40 rounded-full border border-red-500/20 animate-ping" />
            <span className="absolute w-32 h-32 rounded-full border border-red-500/30 animate-pulse" />
          </>
        )}

        {/* Ready ring */}
        {isReady && (
          <span className={cn(
            "absolute w-32 h-32 rounded-full border-2 animate-pulse-ring",
            RING_COLORS.ready
          )} />
        )}

        {/* Circular progress ring — shows recording time */}
        {isRecording && (
          <svg
            className="absolute w-32 h-32 -rotate-90"
            viewBox="0 0 128 128"
            aria-hidden
          >
            <circle
              cx="64" cy="64" r="58"
              fill="none"
              stroke="rgba(239,68,68,0.15)"
              strokeWidth="4"
            />
            <circle
              cx="64" cy="64" r="58"
              fill="none"
              stroke="rgb(239,68,68)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}

        {/* The button itself */}
        <button
          onClick={handleClick}
          disabled={status === "stopping" || isDone}
          aria-label={
            status === "idle"      ? "Request microphone access" :
            status === "ready"     ? "Start recording" :
            status === "recording" ? "Stop recording" :
                                     status
          }
          className={cn(
            "relative z-10 w-24 h-24 rounded-full",
            "flex items-center justify-center",
            "shadow-2xl transition-all duration-200",
            "active:scale-95 focus:outline-none focus:ring-4 focus:ring-soprano/30",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
            STATUS_COLORS[status] ?? "bg-background-tertiary"
          )}
        >
          {isError
            ? <MicOff className="h-10 w-10 text-white" />
            : isRecording
              ? <Square className="h-9 w-9 text-white fill-white" />
              : <Mic    className="h-10 w-10 text-white" />
          }
        </button>
      </div>

      {/* Duration display */}
      <div className="text-center space-y-1">
        {isRecording ? (
          <>
            <p className="text-2xl font-mono font-semibold text-red-400 tabular-nums">
              {formatDuration(duration)}
            </p>
            <p className="text-xs text-muted">
              {maxDuration - duration}s remaining · tap to stop
            </p>
          </>
        ) : status === "idle" ? (
          <p className="text-sm text-muted">Tap to enable microphone</p>
        ) : status === "requesting" ? (
          <p className="text-sm text-muted">Allow microphone access…</p>
        ) : status === "ready" ? (
          <p className="text-sm text-soprano font-medium">
            Ready · tap to start recording
          </p>
        ) : status === "stopping" ? (
          <p className="text-sm text-muted">Processing…</p>
        ) : isDone ? (
          <p className="text-sm text-green-400 font-medium">
            Recorded {formatDuration(duration)}
          </p>
        ) : null}
      </div>

    </div>
  );
}

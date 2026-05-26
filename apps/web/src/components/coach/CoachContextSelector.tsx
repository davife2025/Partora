"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicePart } from "@partora/types";
import type { CoachContext } from "@/hooks/useVoiceCoach";

const PARTS: { value: VoicePart; label: string; color: string; bg: string }[] = [
  { value: "soprano", label: "Soprano", color: "text-soprano", bg: "bg-voice-soprano border-soprano/40" },
  { value: "alto",    label: "Alto",    color: "text-alto",    bg: "bg-voice-alto border-alto/40" },
  { value: "tenor",   label: "Tenor",   color: "text-tenor",   bg: "bg-voice-tenor border-tenor/40" },
  { value: "bass",    label: "Bass",    color: "text-bass",    bg: "bg-voice-bass border-bass/40" },
];

interface CoachContextSelectorProps {
  context:       CoachContext;
  onUpdate:      (ctx: Partial<CoachContext>) => void;
  className?:    string;
}

export function CoachContextSelector({ context, onUpdate, className }: CoachContextSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("glass border-border rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/70">Coach context</span>
          {context.voicePart && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border capitalize",
              PARTS.find((p) => p.value === context.voicePart)?.bg
            )}>
              {context.voicePart}
            </span>
          )}
          {context.songTitle && (
            <span className="text-xs text-muted truncate max-w-[120px]">{context.songTitle}</span>
          )}
        </div>
        {expanded
          ? <ChevronUp   className="h-3.5 w-3.5 text-muted" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted" />
        }
      </button>

      {/* Expanded controls */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          {/* Voice part picker */}
          <div>
            <p className="text-xs text-muted mb-2">Your voice part</p>
            <div className="grid grid-cols-4 gap-2">
              {PARTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onUpdate({ voicePart: p.value })}
                  className={cn(
                    "rounded-xl border py-2.5 text-center text-xs font-medium transition-all",
                    context.voicePart === p.value
                      ? cn(p.bg, "border")
                      : "border-border bg-background-tertiary text-muted hover:text-white"
                  )}
                >
                  <span className={context.voicePart === p.value ? p.color : undefined}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Song info */}
          {(context.songTitle || context.key) && (
            <div className="text-xs space-y-1">
              {context.songTitle && (
                <p className="text-muted">
                  Song: <span className="text-white">{context.songTitle}</span>
                  {context.artist && <span className="text-muted"> · {context.artist}</span>}
                </p>
              )}
              {context.key && (
                <p className="text-muted">
                  Key: <span className="text-soprano">{context.key} {context.mode}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { SolfaDisplay, SolfaText } from "./SolfaDisplay";
import { Badge } from "@/components/ui/index";
import type { VoicePart, VoicePartResult } from "@partora/types";

const PART_META: Record<VoicePart, { label: string; emoji: string; range: string; cardClass: string; badgeVariant: "soprano" | "alto" | "tenor" | "bass" }> = {
  soprano: { label: "Soprano", emoji: "🎶", range: "C4–A5", cardClass: "bg-voice-soprano border-soprano/30", badgeVariant: "soprano" },
  alto:    { label: "Alto",    emoji: "🎵", range: "G3–E5", cardClass: "bg-voice-alto border-alto/30",       badgeVariant: "alto" },
  tenor:   { label: "Tenor",   emoji: "🎤", range: "C3–A4", cardClass: "bg-voice-tenor border-tenor/30",     badgeVariant: "tenor" },
  bass:    { label: "Bass",    emoji: "🎸", range: "E2–E4", cardClass: "bg-voice-bass border-bass/30",       badgeVariant: "bass" },
};

interface VoicePartCardProps {
  result: VoicePartResult;
  defaultExpanded?: boolean;
  className?: string;
}

export function VoicePartCard({ result, defaultExpanded = false, className }: VoicePartCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const meta = PART_META[result.part];

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        meta.cardClass,
        className
      )}
    >
      {/* Header — always visible */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{meta.label}</span>
            <Badge variant={meta.badgeVariant}>{meta.range}</Badge>
          </div>
          {/* Collapsed preview — first 5 solfa syllables */}
          {!expanded && (
            <p className="text-xs text-muted mt-0.5 truncate">
              {result.solfa_text.split(" ").slice(0, 5).join(" ")}…
            </p>
          )}
        </div>
        <span className="text-muted shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-white/10 pt-4">

          {/* Solfa notation */}
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
              Tonic Solfa
            </p>
            {result.solfa_notes.length > 0 ? (
              <SolfaDisplay notes={result.solfa_notes} voicePart={result.part} showLyrics />
            ) : (
              <SolfaText text={result.solfa_text} voicePart={result.part} />
            )}
          </div>

          {/* TTS audio — spoken solfa */}
          {result.tts_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Music2 className="h-3 w-3" /> Spoken Solfa
              </p>
              <AudioPlayer
                src={result.tts_audio_url}
                voicePart={result.part}
                timestamps={result.timestamps}
                solfaText={result.solfa_text}
                downloadFilename={`partora-${result.part}-solfa.mp3`}
              />
            </div>
          )}

          {/* Sung audio — pitched singing */}
          {result.sung_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                🎙️ Sung Demonstration
              </p>
              <AudioPlayer
                src={result.sung_audio_url}
                voicePart={result.part}
                downloadFilename={`partora-${result.part}-sung.mp3`}
              />
            </div>
          )}

          {/* Backing track */}
          {result.backing_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                🎹 Backing Track
              </p>
              <AudioPlayer
                src={result.backing_audio_url}
                voicePart={result.part}
                downloadFilename={`partora-${result.part}-backing.mp3`}
              />
            </div>
          )}

          {/* Note range */}
          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Low</p>
              <p className="text-sm font-mono text-white">{result.range.low}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">High</p>
              <p className="text-sm font-mono text-white">{result.range.high}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Shows all 4 SATB cards — stacked on mobile, grid on desktop */
export function SATBCardGrid({
  soprano, alto, tenor, bass, className,
}: {
  soprano: VoicePartResult;
  alto: VoicePartResult;
  tenor: VoicePartResult;
  bass: VoicePartResult;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {[soprano, alto, tenor, bass].map((result, i) => (
        <VoicePartCard key={result.part} result={result} defaultExpanded={i === 0} />
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { VoicePart, SolfaNote } from "@partora/types";

const PART_COLORS: Record<VoicePart, { pill: string; active: string; text: string }> = {
  soprano: { pill: "bg-background-tertiary border-border text-muted",         active: "bg-soprano border-soprano/40 text-white",        text: "text-soprano" },
  alto:    { pill: "bg-background-tertiary border-border text-muted",         active: "bg-alto border-alto/40 text-white",              text: "text-alto" },
  tenor:   { pill: "bg-background-tertiary border-border text-muted",         active: "bg-tenor border-tenor/40 text-white",            text: "text-tenor" },
  bass:    { pill: "bg-background-tertiary border-border text-muted",         active: "bg-bass border-bass/40 text-white",              text: "text-bass" },
};

interface SolfaDisplayProps {
  notes: SolfaNote[];
  voicePart: VoicePart;
  /** Index of the currently playing note (-1 = none) */
  activeIndex?: number;
  /** Show the lyric syllable under each solfa note */
  showLyrics?: boolean;
  className?: string;
}

export function SolfaDisplay({
  notes,
  voicePart,
  activeIndex = -1,
  showLyrics = true,
  className,
}: SolfaDisplayProps) {
  const colors = PART_COLORS[voicePart];

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {notes.map((note, i) => {
        const isActive = i === activeIndex;
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "solfa-pill border transition-all duration-100",
                isActive
                  ? cn(colors.active, "scale-110 shadow-lg")
                  : colors.pill
              )}
            >
              {note.syllable}
            </span>
            {showLyrics && note.lyric_syllable && (
              <span className="text-[10px] text-muted truncate max-w-[40px] text-center">
                {note.lyric_syllable}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Plain text solfa string display — used when notes array isn't available */
export function SolfaText({
  text,
  voicePart,
  activeWord = -1,
  className,
}: {
  text: string;
  voicePart: VoicePart;
  activeWord?: number;
  className?: string;
}) {
  const words  = text.split(" ").filter(Boolean);
  const colors = PART_COLORS[voicePart];

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "solfa-pill border transition-all duration-100",
            i === activeWord
              ? cn(colors.active, "scale-110 shadow-lg")
              : colors.pill
          )}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VoicePart } from "@partora/types";

const PARTS: { value: VoicePart; label: string; range: string; color: string; bg: string }[] = [
  { value: "soprano", label: "Soprano", range: "C4–A5", color: "text-soprano", bg: "bg-voice-soprano border-soprano/40" },
  { value: "alto",    label: "Alto",    range: "G3–E5", color: "text-alto",    bg: "bg-voice-alto border-alto/40" },
  { value: "tenor",   label: "Tenor",   range: "C3–A4", color: "text-tenor",   bg: "bg-voice-tenor border-tenor/40" },
  { value: "bass",    label: "Bass",    range: "E2–E4", color: "text-bass",    bg: "bg-voice-bass border-bass/40" },
];

export function VoicePartSelect() {
  const [selected, setSelected] = useState<VoicePart | "">("");

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/80">
        Your voice part <span className="text-muted font-normal">(optional)</span>
      </label>
      <input type="hidden" name="preferred_voice_part" value={selected} />
      <div className="grid grid-cols-4 gap-2">
        {PARTS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setSelected(selected === p.value ? "" : p.value)}
            className={cn(
              "rounded-xl border px-2 py-3 text-center transition-all duration-150",
              "hover:scale-105 active:scale-95",
              selected === p.value
                ? cn(p.bg, "border")
                : "border-border bg-background-tertiary"
            )}
          >
            <div className={cn("text-xs font-semibold", selected === p.value ? p.color : "text-white")}>
              {p.label}
            </div>
            <div className="text-[10px] text-muted mt-0.5">{p.range}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

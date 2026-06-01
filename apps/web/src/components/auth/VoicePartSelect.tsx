"use client";

import { useState } from "react";
import { cn }       from "@/lib/utils";

const PARTS = [
  { value: "soprano", label: "Soprano", range: "C4–A5", color: "#7F77DD" },
  { value: "alto",    label: "Alto",    range: "G3–E5", color: "#2DA882" },
  { value: "tenor",   label: "Tenor",   range: "C3–A4", color: "#D4820A" },
  { value: "bass",    label: "Bass",    range: "E2–E4", color: "#185FA5" },
];

export function VoicePartSelect() {
  const [selected, setSelected] = useState("");

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/60">
        Voice part <span className="text-white/25 font-normal">(optional)</span>
      </label>
      <input type="hidden" name="preferred_voice_part" value={selected} />
      <div className="grid grid-cols-4 gap-2">
        {PARTS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setSelected(selected === p.value ? "" : p.value)}
            className={cn(
              "rounded-xl border py-2.5 text-center transition-all duration-150 active:scale-95",
              selected === p.value ? "border" : "border-white/8 bg-white/3"
            )}
            style={selected === p.value ? {
              borderColor: p.color+"50",
              background:  p.color+"15",
            } : {}}
          >
            <p className="text-xs font-semibold" style={{ color: selected === p.value ? p.color : "rgba(255,255,255,0.5)" }}>
              {p.label}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{p.range}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

type FilterSource = "all" | "lyrics" | "upload" | "search" | "record";

const SOURCE_LABELS: Record<FilterSource, string> = {
  all:    "All",
  lyrics: "✍️ Typed",
  upload: "🎵 Uploaded",
  search: "🔍 Searched",
  record: "🎤 Recorded",
};

interface LibraryFilterProps {
  active:   FilterSource;
  onChange: (f: FilterSource) => void;
  counts:   Partial<Record<FilterSource, number>>;
}

export function LibraryFilter({ active, onChange, counts }: LibraryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {(Object.keys(SOURCE_LABELS) as FilterSource[]).map((src) => {
        const count = src === "all"
          ? Object.values(counts).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)
          : counts[src];

        return (
          <button
            key={src}
            onClick={() => onChange(src)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
              "border transition-all duration-150",
              active === src
                ? "bg-soprano border-soprano/40 text-white"
                : "border-border bg-background-secondary text-muted hover:text-white hover:border-border"
            )}
          >
            {SOURCE_LABELS[src]}
            {count !== undefined && count > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                active === src ? "bg-white/20" : "bg-background-tertiary"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface LibraryStatsProps {
  total:    number;
  bySource: Record<string, number>;
  className?: string;
}

const SOURCE_CONFIG: Record<string, { icon: string; color: string }> = {
  lyrics: { icon: "✍️", color: "text-soprano" },
  upload: { icon: "🎵", color: "text-alto"    },
  search: { icon: "🔍", color: "text-tenor"   },
  record: { icon: "🎤", color: "text-bass"    },
};

export function LibraryStats({ total, bySource, className }: LibraryStatsProps) {
  if (total === 0) return null;

  return (
    <div className={cn(
      "grid grid-cols-2 gap-3",
      className
    )}>
      {/* Total */}
      <div className="glass border-border rounded-2xl p-4 col-span-2 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-white">{total}</p>
          <p className="text-xs text-muted mt-0.5">songs analysed</p>
        </div>
        <div className="flex gap-3">
          {Object.entries(bySource).filter(([,v]) => v > 0).map(([src, count]) => {
            const cfg = SOURCE_CONFIG[src];
            if (!cfg) return null;
            return (
              <div key={src} className="text-center">
                <p className={cn("text-base font-semibold", cfg.color)}>{count}</p>
                <p className="text-[10px] text-muted">{cfg.icon}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

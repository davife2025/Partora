import { cn } from "@/lib/utils";
import type { CoachStatus } from "@/hooks/useVoiceCoach";

const STATUS_CONFIG: Record<CoachStatus, { label: string; dot: string; text: string }> = {
  disconnected: { label: "Offline",     dot: "bg-muted",           text: "text-muted"   },
  connecting:   { label: "Connecting…", dot: "bg-tenor animate-pulse", text: "text-tenor" },
  connected:    { label: "Ready",       dot: "bg-green-400",        text: "text-green-400" },
  thinking:     { label: "Thinking…",   dot: "bg-soprano animate-pulse", text: "text-soprano" },
  speaking:     { label: "Speaking…",   dot: "bg-alto animate-pulse",    text: "text-alto"    },
  error:        { label: "Error",       dot: "bg-red-400",          text: "text-red-400" },
};

export function CoachStatusBadge({
  status, className,
}: {
  status: CoachStatus;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
      <span className={cn("text-xs font-medium", cfg.text)}>{cfg.label}</span>
    </div>
  );
}

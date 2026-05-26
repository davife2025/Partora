import { cn } from "@/lib/utils";

// ─── Badge ────────────────────────────────────────────────────────
type BadgeVariant = "default" | "soprano" | "alto" | "tenor" | "bass" | "success" | "warning" | "danger";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: "bg-background-tertiary text-muted border-border",
  soprano: "bg-voice-soprano text-soprano border-soprano/30",
  alto:    "bg-voice-alto text-alto border-alto/30",
  tenor:   "bg-voice-tenor text-tenor border-tenor/30",
  bass:    "bg-voice-bass text-bass border-bass/30",
  success: "bg-green-500/10 text-green-400 border-green-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  danger:  "bg-red-500/10 text-red-400 border-red-500/30",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        BADGE_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────
interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string }

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-3" };
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "block rounded-full border-muted/30 border-t-soprano animate-spin",
        sizes[size],
        className
      )}
    />
  );
}

// ─── Divider ─────────────────────────────────────────────────────
export function Divider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="flex-1 border-t border-border" />
      {label && (
        <span className="mx-3 text-xs text-muted bg-background-secondary px-1">{label}</span>
      )}
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────
interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ emoji = "🎵", title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-14 px-6 space-y-3", className)}>
      <span className="text-5xl mb-2">{emoji}</span>
      <h3 className="text-white font-semibold">{title}</h3>
      {description && <p className="text-muted text-sm max-w-xs">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-background-tertiary", className)} />
  );
}

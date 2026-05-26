"use client";

import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soprano" | "alto" | "tenor" | "bass";
type Size    = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-soprano text-white hover:bg-soprano-dark shadow-lg shadow-soprano/20",
  secondary: "bg-background-tertiary text-white border border-border hover:border-border hover:bg-background-secondary",
  ghost:     "text-muted hover:text-white hover:bg-background-tertiary",
  danger:    "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
  soprano:   "bg-voice-soprano text-soprano border border-soprano/40 hover:border-soprano/60",
  alto:      "bg-voice-alto text-alto border border-alto/40 hover:border-alto/60",
  tenor:     "bg-voice-tenor text-tenor border border-tenor/40 hover:border-tenor/60",
  bass:      "bg-voice-bass text-bass border border-bass/40 hover:border-bass/60",
};

const SIZES: Record<Size, string> = {
  sm:   "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md:   "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg:   "px-6 py-3.5 text-base rounded-2xl gap-2.5",
  icon: "p-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-150 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:ring-offset-2 focus:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
}

/** Submit button that auto-reads form pending state */
export function SubmitButton({ children, ...props }: Omit<ButtonProps, "loading">) {
  const { pending } = useFormStatus();
  return <Button loading={pending} {...props}>{children}</Button>;
}

import { cn } from "@/lib/utils";

// ─── Input ────────────────────────────────────────────────────────
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, hint, error, prefix, suffix, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-muted flex items-center">{prefix}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-border bg-background-tertiary",
            "px-4 py-3 text-sm text-white placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:border-soprano/60",
            "transition-all duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500/50 focus:ring-red-500/30",
            prefix && "pl-10",
            suffix && "pr-10",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-muted flex items-center">{suffix}</span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-border bg-background-tertiary",
          "px-4 py-3 text-sm text-white placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:border-soprano/60",
          "transition-all duration-150 resize-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500/50 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, hint, error, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-border bg-background-tertiary",
          "px-4 py-3 text-sm text-white",
          "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:border-soprano/60",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-background-secondary">
            {o.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
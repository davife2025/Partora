interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefixEl?: React.ReactNode;
  suffixEl?: React.ReactNode;
}

export function Input({ label, hint, error, prefixEl, suffixEl, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixEl && (
          <span className="absolute left-3 text-muted flex items-center">{prefixEl}</span>
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
            prefixEl && "pl-10",
            suffixEl && "pr-10",
            className
          )}
          {...props}
        />
        {suffixEl && (
          <span className="absolute right-3 text-muted flex items-center">{suffixEl}</span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
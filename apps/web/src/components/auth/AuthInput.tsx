import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name:  string;
  error?: string;
}

export function AuthInput({ label, name, error, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-white/60">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn(
          "w-full rounded-2xl border bg-white/5",
          "px-4 py-3 text-sm text-white placeholder:text-white/20",
          "focus:outline-none transition-all duration-150",
          error
            ? "border-red-500/50 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20"
            : "border-white/8 focus:border-[#7F77DD]/60 focus:ring-2 focus:ring-[#7F77DD]/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

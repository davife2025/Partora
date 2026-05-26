import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export function AuthInput({ label, name, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn(
          "w-full rounded-xl border border-border bg-background-tertiary",
          "px-4 py-3 text-sm text-white placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:border-soprano/60",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}

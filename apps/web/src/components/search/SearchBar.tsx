"use client";

import { useRef } from "react";
import { Search, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value:    string;
  onChange: (v: string) => void;
  onClear:  () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  value, onChange, onClear,
  loading, placeholder = "Search for a song or artist…",
  autoFocus, className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Left icon */}
      <span className="absolute left-4 pointer-events-none">
        {loading
          ? <Loader className="h-4 w-4 text-tenor animate-spin" />
          : <Search className="h-4 w-4 text-muted" />
        }
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-2xl border border-border bg-background-secondary",
          "pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-tenor/40 focus:border-tenor/60",
          "transition-all duration-150",
        )}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => { onClear(); inputRef.current?.focus(); }}
          className="absolute right-3 p-1.5 rounded-lg text-muted hover:text-white hover:bg-background-tertiary transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

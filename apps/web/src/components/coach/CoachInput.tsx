"use client";

import { useState, useRef } from "react";
import { Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How do I sing my part?",
  "What does Do Re Mi mean?",
  "Explain the soprano range",
  "What is tonic solfa?",
  "How do I find my harmony?",
  "What key are we in?",
];

interface CoachInputProps {
  onSend:    (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CoachInput({ onSend, disabled, className }: CoachInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Suggestions (shown when empty) */}
      {!value && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => { onSend(s); }}
              className={cn(
                "shrink-0 text-xs px-3 py-1.5 rounded-full border border-border",
                "bg-background-secondary text-muted whitespace-nowrap",
                "hover:border-soprano/40 hover:text-white transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask your voice coach…"
            rows={1}
            className={cn(
              "w-full rounded-2xl border border-border bg-background-secondary",
              "px-4 py-3 text-sm text-white placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:border-soprano/60",
              "resize-none overflow-hidden transition-all duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[48px] max-h-[120px]"
            )}
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            "transition-all duration-150 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-soprano/40",
            value.trim() && !disabled
              ? "bg-soprano text-white shadow-lg shadow-soprano/30"
              : "bg-background-tertiary text-muted cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

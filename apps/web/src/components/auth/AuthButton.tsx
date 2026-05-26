"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthButton({ children, className }: AuthButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full rounded-xl bg-soprano px-4 py-3 text-sm font-semibold text-white",
        "hover:bg-soprano-dark transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-soprano/40 focus:ring-offset-2 focus:ring-offset-background-secondary",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

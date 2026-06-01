"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function AuthButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full rounded-2xl bg-[#7F77DD] px-4 py-3.5 text-sm font-semibold text-white",
        "hover:bg-[#6B63CC] transition-all duration-150 active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/40 focus:ring-offset-2 focus:ring-offset-[#13131E]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Please wait…
        </>
      ) : children}
    </button>
  );
}

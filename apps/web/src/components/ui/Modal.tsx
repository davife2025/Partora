"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Full-screen modal on desktop, bottom sheet on mobile */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={ref}
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          "relative z-10 w-full sm:max-w-md",
          "glass border-border rounded-t-3xl sm:rounded-3xl",
          "max-h-[90vh] overflow-y-auto",
          "animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200",
          className
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-background-tertiary transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="px-6 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error:   "border-red-500/30 bg-red-500/10 text-red-400",
  info:    "border-soprano/30 bg-soprano/10 text-soprano",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, "success"),
    error:   (m) => toast(m, "error"),
    info:    (m) => toast(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4"
      >
        {toasts.map(({ id, type, message }) => {
          const Icon = ICONS[type];
          return (
            <div
              key={id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-2xl border",
                "shadow-xl shadow-black/30 backdrop-blur-md",
                "animate-in slide-in-from-top-2 duration-200",
                STYLES[type]
              )}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm flex-1">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

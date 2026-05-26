"use client";

import { CheckCircle, Circle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProgressStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
};

interface AnalysisProgressProps {
  steps: ProgressStep[];
  className?: string;
}

export function AnalysisProgress({ steps, className }: AnalysisProgressProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-3">
          {/* Icon */}
          <div className="shrink-0">
            {step.status === "done" && <CheckCircle className="h-5 w-5 text-green-400" />}
            {step.status === "active" && <Loader className="h-5 w-5 text-soprano animate-spin" />}
            {step.status === "pending" && <Circle className="h-5 w-5 text-muted" />}
            {step.status === "error" && <Circle className="h-5 w-5 text-red-400" />}
          </div>

          {/* Label */}
          <span className={cn(
            "text-sm transition-colors",
            step.status === "done"    && "text-white",
            step.status === "active"  && "text-soprano font-medium",
            step.status === "pending" && "text-muted",
            step.status === "error"   && "text-red-400",
          )}>
            {step.label}
          </span>

          {/* Connector */}
          {i < steps.length - 1 && (
            <div className={cn(
              "hidden", /* vertical connector below handled by spacing */
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

/** Compact inline progress bar with label */
export function ProgressBar({
  value,
  label,
  voicePart,
  className,
}: {
  value: number;
  label?: string;
  voicePart?: "soprano" | "alto" | "tenor" | "bass";
  className?: string;
}) {
  const colors = {
    soprano: "bg-soprano",
    alto:    "bg-alto",
    tenor:   "bg-tenor",
    bass:    "bg-bass",
  };
  const color = voicePart ? colors[voicePart] : "bg-soprano";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

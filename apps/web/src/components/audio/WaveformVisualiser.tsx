"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { VoicePart } from "@partora/types";

const PART_COLORS: Record<VoicePart | "default", string> = {
  soprano: "#7F77DD",
  alto:    "#2DA882",
  tenor:   "#D4820A",
  bass:    "#185FA5",
  default: "#7F77DD",
};

interface WaveformVisualiserProps {
  /** Pass an AnalyserNode for live mic input, or omit for idle animation */
  analyser?: AnalyserNode | null;
  /** Static bars — number of bars when no analyser is connected */
  bars?: number;
  height?: number;
  voicePart?: VoicePart;
  active?: boolean;
  className?: string;
}

export function WaveformVisualiser({
  analyser,
  bars = 32,
  height = 48,
  voicePart = "soprano",
  active = false,
  className,
}: WaveformVisualiserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const color     = PART_COLORS[voicePart ?? "default"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const barCount = analyser ? analyser.frequencyBinCount : bars;
    const data     = analyser ? new Uint8Array(barCount) : null;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      const barW   = W / barCount - 2;
      const center = H / 2;

      for (let i = 0; i < barCount; i++) {
        let amplitude: number;

        if (analyser && data) {
          analyser.getByteFrequencyData(data);
          amplitude = (data[i] / 255) * (H / 2);
        } else if (active) {
          // Idle pulsing animation
          amplitude = (Math.sin(Date.now() / 300 + i * 0.5) * 0.5 + 0.5) * (H / 3);
        } else {
          amplitude = 2; // flat line when idle
        }

        const x = i * (barW + 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(x, center - amplitude, barW, amplitude * 2, 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, bars, color, active]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full rounded-xl", className)}
      style={{ height }}
      aria-label="Audio waveform"
    />
  );
}

/** Simple static waveform bars (CSS-only, no canvas) */
export function StaticWaveform({
  voicePart = "soprano",
  active = false,
  barCount = 20,
  className,
}: {
  voicePart?: VoicePart;
  active?: boolean;
  barCount?: number;
  className?: string;
}) {
  const colors: Record<VoicePart, string> = {
    soprano: "bg-soprano",
    alto:    "bg-alto",
    tenor:   "bg-tenor",
    bass:    "bg-bass",
  };

  return (
    <div className={cn("flex items-center justify-center gap-0.5", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all",
            colors[voicePart],
            active ? "animate-waveform" : "h-1 opacity-30"
          )}
          style={active ? { animationDelay: `${(i % 5) * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}

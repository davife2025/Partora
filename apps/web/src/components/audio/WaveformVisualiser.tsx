"use client";
import { useEffect, useRef } from "react";
import type { VoicePart } from "@partora/types";

const COLORS: Record<VoicePart,string> = { soprano:"#7F77DD",alto:"#2DA882",tenor:"#D4820A",bass:"#185FA5" };

export function WaveformVisualiser({ analyser, voicePart="soprano", active=false, height=48, className="" }:{
  analyser?: AnalyserNode; voicePart?: VoicePart; active?: boolean; height?: number; className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const color     = COLORS[voicePart];

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.offsetWidth; const H = canvas.offsetHeight;
    canvas.width = W*devicePixelRatio; canvas.height = H*devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const bars = analyser ? analyser.frequencyBinCount : 32;
    const data = analyser ? new Uint8Array(bars) : null;

    function draw() {
      if (!ctx||!canvas) return;
      ctx.clearRect(0,0,W,H);
      const bw = W/bars-1, center = H/2;
      for (let i=0;i<bars;i++) {
        let amp: number;
        if (analyser&&data) { analyser.getByteFrequencyData(data); amp=(data[i]/255)*(H/2); }
        else if (active) amp=(Math.sin(Date.now()/300+i*0.5)*0.5+0.5)*(H/3);
        else amp=2;
        ctx.fillStyle=color; ctx.globalAlpha=0.8;
        ctx.beginPath(); ctx.roundRect(i*(bw+1),center-amp,Math.max(bw,2),amp*2,2); ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  },[analyser,color,active]);

  return <canvas ref={canvasRef} className={`w-full rounded-xl ${className}`} style={{height}} aria-hidden/>;
}


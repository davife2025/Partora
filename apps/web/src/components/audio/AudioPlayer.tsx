"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import type { VoicePart, WordTimestamp } from "@partora/types";

const COLORS: Record<VoicePart,string> = { soprano:"#7F77DD", alto:"#2DA882", tenor:"#D4820A", bass:"#185FA5" };

interface AudioPlayerProps {
  src:               string;
  voicePart?:        VoicePart;
  timestamps?:       WordTimestamp[];
  solfaText?:        string;
  downloadFilename?: string;
}

export function AudioPlayer({ src, voicePart="soprano", timestamps=[], solfaText="", downloadFilename }: AudioPlayerProps) {
  const audioRef   = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIdx, setActiveIdx] = useState(-1);
  const color = COLORS[voicePart];
  const syllables = solfaText.split(" ").filter(Boolean);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onMeta  = () => setDuration(a.duration);
    const onTime  = () => {
      const ms = a.currentTime * 1000;
      setProgress(a.duration ? (a.currentTime/a.duration)*100 : 0);
      if (timestamps.length) setActiveIdx(timestamps.findIndex(t => ms>=t.start_ms && ms<=t.end_ms));
    };
    a.addEventListener("play",onPlay); a.addEventListener("pause",onPause);
    a.addEventListener("ended",onEnded); a.addEventListener("loadedmetadata",onMeta);
    a.addEventListener("timeupdate",onTime);
    return () => { a.removeEventListener("play",onPlay); a.removeEventListener("pause",onPause);
      a.removeEventListener("ended",onEnded); a.removeEventListener("loadedmetadata",onMeta);
      a.removeEventListener("timeupdate",onTime); };
  }, [src, timestamps]);

  const toggle  = () => { if (!audioRef.current) return; playing ? audioRef.current.pause() : audioRef.current.play(); };
  const restart = () => { if (!audioRef.current) return; audioRef.current.currentTime=0; audioRef.current.play(); };
  const seek    = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current||!duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX-r.left)/r.width)*duration;
  };
  const fmt = (s:number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="space-y-2.5">
      <audio ref={audioRef} src={src} preload="metadata"/>

      {syllables.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {syllables.map((s,i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium border transition-all duration-100"
                  style={i===activeIdx
                    ? {background:color,color:"#fff",borderColor:"transparent",transform:"scale(1.1)"}
                    : {background:color+"15",color:color,borderColor:color+"30"}}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
           className="h-1.5 rounded-full bg-white/5 cursor-pointer group relative" onClick={seek}>
        <div className="h-full rounded-full transition-all duration-100" style={{width:`${progress}%`,background:color}}/>
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
             style={{left:`calc(${progress}% - 6px)`,background:color}}/>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={restart} className="p-1 text-white/20 hover:text-white transition-colors" aria-label="Restart">
          <RotateCcw className="h-3.5 w-3.5"/>
        </button>
        <button onClick={toggle}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{background:color}} aria-label={playing?"Pause":"Play"}>
          {playing ? <Pause className="h-3.5 w-3.5 text-white fill-white"/> : <Play className="h-3.5 w-3.5 text-white fill-white translate-x-0.5"/>}
        </button>
        <span className="text-xs font-mono tabular-nums" style={{color}}>
          {fmt((progress/100)*duration)} / {fmt(duration)}
        </span>
        {downloadFilename && (
          <a href={src} download={downloadFilename} className="ml-auto p-1 text-white/20 hover:text-white transition-colors">
            <Download className="h-3.5 w-3.5"/>
          </a>
        )}
      </div>
    </div>
  );
}

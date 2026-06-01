"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Music2, MessageCircle } from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useRouter }   from "next/navigation";
import type { VoicePart, VoicePartResult } from "@partora/types";

const PARTS: Record<VoicePart,{label:string;emoji:string;range:string;color:string;bg:string;border:string}> = {
  soprano:{label:"Soprano",emoji:"🎶",range:"C4–A5",color:"#7F77DD",bg:"rgba(127,119,221,0.08)",border:"rgba(127,119,221,0.2)"},
  alto:   {label:"Alto",   emoji:"🎵",range:"G3–E5",color:"#2DA882",bg:"rgba(45,168,130,0.08)",  border:"rgba(45,168,130,0.2)"},
  tenor:  {label:"Tenor",  emoji:"🎤",range:"C3–A4",color:"#D4820A",bg:"rgba(212,130,10,0.08)",  border:"rgba(212,130,10,0.2)"},
  bass:   {label:"Bass",   emoji:"🎸",range:"E2–E4",color:"#185FA5",bg:"rgba(24,95,165,0.08)",   border:"rgba(24,95,165,0.2)"},
};

interface VoicePartCardProps {
  result:          VoicePartResult;
  resultId?:       string;
  songTitle?:      string;
  artist?:         string;
  musicalKey?:     string;
  mode?:           string;
  defaultExpanded?: boolean;
}

export function VoicePartCard({ result, resultId, songTitle, artist, musicalKey, mode, defaultExpanded=false }: VoicePartCardProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const router = useRouter();
  const m = PARTS[result.part];

  function goToCoach() {
    const p = new URLSearchParams();
    if (result.part) p.set("voice_part", result.part);
    if (songTitle) p.set("song_title", songTitle);
    if (artist)    p.set("artist", artist);
    if (musicalKey) p.set("key", musicalKey);
    if (mode)      p.set("mode", mode);
    router.push(`/coach?${p.toString()}`);
  }

  const syllables = result.solfa_text?.split(" ").filter(Boolean) ?? [];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{borderColor:m.border,background:m.bg}}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={()=>setOpen(o=>!o)}>
        <span className="text-2xl">{m.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{m.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                  style={{color:m.color,borderColor:m.color+"40",background:m.color+"15"}}>{m.range}</span>
          </div>
          {!open && <p className="text-xs mt-0.5 truncate" style={{color:m.color+"80"}}>{syllables.slice(0,6).join(" ")}…</p>}
        </div>
        <span style={{color:m.color+"60"}}>{open ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-4 border-t" style={{borderColor:m.border}}>

          {/* Solfa pills */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-2" style={{color:m.color+"80"}}>Tonic Solfa</p>
            <div className="flex flex-wrap gap-1.5">
              {syllables.map((s,i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                      style={{color:m.color,borderColor:m.color+"40",background:m.color+"15"}}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Spoken solfa audio */}
          {result.tts_audio_url && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1" style={{color:m.color+"80"}}>
                <Music2 className="h-3 w-3"/> Spoken Solfa
              </p>
              <AudioPlayer src={result.tts_audio_url} voicePart={result.part}
                timestamps={result.timestamps} solfaText={result.solfa_text}
                downloadFilename={`partora-${result.part}-solfa.mp3`}/>
            </div>
          )}

          {/* Sung audio */}
          {result.sung_audio_url && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{color:m.color+"80"}}>🎙️ Sung Demo</p>
              <AudioPlayer src={result.sung_audio_url} voicePart={result.part}
                downloadFilename={`partora-${result.part}-sung.mp3`}/>
            </div>
          )}

          {/* Backing */}
          {result.backing_audio_url && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{color:m.color+"80"}}>🎹 Backing Track</p>
              <AudioPlayer src={result.backing_audio_url} voicePart={result.part}
                downloadFilename={`partora-${result.part}-backing.mp3`}/>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-4 text-xs">
              <div><p className="text-white/20 text-[9px] uppercase">Low</p><p className="font-mono text-white">{result.range.low}</p></div>
              <div><p className="text-white/20 text-[9px] uppercase">High</p><p className="font-mono text-white">{result.range.high}</p></div>
            </div>
            <button onClick={goToCoach}
              className="flex items-center gap-1.5 text-xs border rounded-xl px-3 py-1.5 transition-all"
              style={{color:m.color,borderColor:m.color+"30",background:m.color+"08"}}>
              <MessageCircle className="h-3 w-3"/> Ask Coach
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SATBCardGrid({ soprano,alto,tenor,bass,resultId,songTitle,artist,musicalKey,mode,onSingComplete }:{
  soprano:VoicePartResult; alto:VoicePartResult; tenor:VoicePartResult; bass:VoicePartResult;
  resultId?:string; songTitle?:string; artist?:string; musicalKey?:string; mode?:string; onSingComplete?:()=>void;
}) {
  return (
    <div className="space-y-3">
      {[soprano,alto,tenor,bass].map((r,i) => (
        <VoicePartCard key={r.part} result={r} resultId={resultId}
          songTitle={songTitle} artist={artist} musicalKey={musicalKey} mode={mode}
          defaultExpanded={i===0}/>
      ))}
    </div>
  );
}

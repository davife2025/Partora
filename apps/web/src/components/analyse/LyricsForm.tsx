"use client";
import { useState } from "react";
import type { MusicalKey, MusicalMode, LyricsAnalysisRequest } from "@partora/types";

const KEYS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function LyricsForm({ onSubmit }: { onSubmit: (d: LyricsAnalysisRequest & { title?:string; artist?:string }) => void }) {
  const [lyrics, setLyrics]   = useState("");
  const [key,    setKey]       = useState<MusicalKey|"">("");
  const [mode,   setMode]      = useState<MusicalMode>("major");
  const [title,  setTitle]     = useState("");
  const [artist, setArtist]    = useState("");
  const [errors, setErrors]    = useState<Record<string,string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (lyrics.trim().length < 10) errs.lyrics = "Please enter at least 10 characters";
    if (!key) errs.key = "Please select a key";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ lyrics: lyrics.trim(), key: key as MusicalKey, mode, title: title||undefined, artist: artist||undefined });
  }

  const inputCls = "w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input value={title}  onChange={e=>setTitle(e.target.value)}  placeholder="Song title (optional)"  className={`${inputCls} border-white/8 focus:border-[#7F77DD]/50`}/>
        <input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artist (optional)"      className={`${inputCls} border-white/8 focus:border-[#7F77DD]/50`}/>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <select value={key} onChange={e=>setKey(e.target.value as MusicalKey)}
            className={`${inputCls} ${errors.key?"border-red-500/50":"border-white/8 focus:border-[#7F77DD]/50"}`}>
            <option value="" className="bg-[#13131E]">Select key…</option>
            {KEYS.map(k => <option key={k} value={k} className="bg-[#13131E]">{k}</option>)}
          </select>
          {errors.key && <p className="text-xs text-red-400 mt-1">{errors.key}</p>}
        </div>
        <div className="flex rounded-2xl border border-white/8 overflow-hidden">
          {(["major","minor"] as MusicalMode[]).map(m => (
            <button key={m} type="button" onClick={()=>setMode(m)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-all
                ${mode===m ? "bg-[#7F77DD]/20 text-[#7F77DD]" : "text-white/30 hover:text-white"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea value={lyrics} onChange={e=>setLyrics(e.target.value)} rows={8}
          placeholder={"Paste your song lyrics here…\n\nVerse 1:\nAmazing grace how sweet the sound…"}
          className={`${inputCls} resize-none ${errors.lyrics?"border-red-500/50":"border-white/8 focus:border-[#7F77DD]/50"}`}/>
        <div className="flex justify-between mt-1">
          {errors.lyrics ? <p className="text-xs text-red-400">{errors.lyrics}</p> : <span/>}
          <p className="text-xs text-white/20">{lyrics.length} chars</p>
        </div>
      </div>

      <button type="submit"
        className="w-full py-4 rounded-2xl bg-[#7F77DD] text-white font-semibold text-sm hover:bg-[#6B63CC] transition-all active:scale-[0.98]">
        Generate SATB Parts
      </button>
    </form>
  );
}

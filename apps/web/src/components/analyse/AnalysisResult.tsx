"use client";
import { useState } from "react";
import { SATBCardGrid }  from "@/components/solfa/VoicePartCard";
import { RefreshCw, BookmarkPlus, Share2 } from "lucide-react";
import { useToast }      from "@/components/ui/Toast";
import { api }           from "@/lib/api";
import type { SATBResult } from "@partora/types";

export function AnalysisResult({ result, onReset }: { result: SATBResult; onReset: () => void }) {
  const { success, error } = useToast();
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const song = (result as unknown as { song?: { title?: string; artist?: string } }).song;

  async function handleSave() {
    setSaving(true);
    const res = await api.post("/api/user/library", { song_id: result.song_id });
    setSaving(false);
    if (res.success) { setSaved(true); success("Saved to library!"); }
    else error("Could not save");
  }

  async function handleShare() {
    const url = `${window.location.origin}/analyse/${result.song_id}`;
    if (navigator.share) await navigator.share({ title: song?.title ?? "Partora", url });
    else { await navigator.clipboard.writeText(url); success("Link copied!"); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{song?.title ?? "Results"}</h2>
          {song?.artist && <p className="text-sm text-white/40">{song.artist}</p>}
          <span className="inline-block mt-1.5 text-[10px] px-2.5 py-1 rounded-full border font-medium"
                style={{color:"#7F77DD",borderColor:"#7F77DD40",background:"#7F77DD15"}}>
            {result.key} {result.mode}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleShare}
            className="p-2.5 rounded-xl border border-white/8 bg-white/3 text-white/40 hover:text-white transition-all">
            <Share2 className="h-4 w-4"/>
          </button>
          <button onClick={handleSave} disabled={saved || saving}
            className={`p-2.5 rounded-xl border transition-all ${saved ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/8 bg-white/3 text-white/40 hover:text-white"}`}>
            <BookmarkPlus className="h-4 w-4"/>
          </button>
        </div>
      </div>

      <SATBCardGrid
        soprano={result.soprano} alto={result.alto} tenor={result.tenor} bass={result.bass}
        resultId={result.id} songTitle={song?.title} artist={song?.artist}
        musicalKey={result.key} mode={result.mode}
      />

      <button onClick={onReset}
        className="w-full py-3 rounded-2xl border border-white/8 text-white/30 text-sm hover:text-white hover:bg-white/3 transition-all flex items-center justify-center gap-2">
        <RefreshCw className="h-3.5 w-3.5"/> Analyse another song
      </button>
    </div>
  );
}

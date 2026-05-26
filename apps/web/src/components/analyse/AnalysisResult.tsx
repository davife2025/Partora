"use client";

import { useState } from "react";
import { BookmarkPlus, Share2, RefreshCw } from "lucide-react";
import { SATBCardGrid } from "@/components/solfa/VoicePartCard";
import { Button }       from "@/components/ui/Button";
import { Badge }        from "@/components/ui/index";
import { useToast }     from "@/components/ui/Toast";
import { api }          from "@/lib/api";
import type { SATBResult } from "@partora/types";

interface AnalysisResultProps {
  result:  SATBResult;
  onReset: () => void;
}

export function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [, forceRefresh]    = useState(0);

  const song = (result as unknown as { song?: { title?: string; artist?: string } }).song;

  async function handleSave() {
    setSaving(true);
    const res = await api.post("/api/user/library", { song_id: result.song_id });
    setSaving(false);
    if (res.success) { setSaved(true); success("Saved to your library!"); }
    else error("Could not save — please try again");
  }

  async function handleShare() {
    const url = `${window.location.origin}/analyse/${result.song_id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Partora analysis", url });
      else { await navigator.clipboard.writeText(url); success("Link copied!"); }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {song?.title ?? "Results"}
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="soprano">{result.key} {result.mode}</Badge>
            <Badge variant="default">SATB harmonisation</Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant={saved ? "secondary" : "soprano"} size="icon"
            onClick={handleSave} loading={saving} disabled={saved}
            aria-label="Save to library"
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SATBCardGrid now receives resultId for sing generation + voice changer */}
      <SATBCardGrid
        soprano={result.soprano}
        alto={result.alto}
        tenor={result.tenor}
        bass={result.bass}
        resultId={result.id}
        songTitle={song?.title}
        artist={song?.artist}
        musicalKey={result.key}
        mode={result.mode}
        onSingComplete={() => forceRefresh((n) => n + 1)}
      />

      <Button variant="ghost" size="sm" fullWidth onClick={onReset} className="mt-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Analyse another song
      </Button>
    </div>
  );
}

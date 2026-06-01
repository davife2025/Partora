"use client";
import { PageHeader }        from "@/components/layout/PageHeader";
import { useSearch }         from "@/hooks/useSearch";
import { useSearchAnalysis } from "@/hooks/useSearchAnalysis";
import { AnalysisResult }    from "@/components/analyse/AnalysisResult";
import { Loader, Search, X, Sparkles, Music, AlertCircle } from "lucide-react";
import type { SATBResult, SongSearchResult } from "@partora/types";

export default function SearchPage() {
  const { query, results, loading, setQuery, clear } = useSearch();
  const { status, progress, step, result, error, song, analyseSong, reset } = useSearchAnalysis();
  const busy = status !== "idle" && status !== "failed";

  function handleAnalyse(s: SongSearchResult) { clear(); analyseSong(s); }

  return (
    <div className="min-h-screen">
      <PageHeader title="Search Songs" backHref="/home"/>
      <div className="px-5 pb-10 space-y-4">

        {!busy && (
          <div className="relative flex items-center">
            {loading
              ? <Loader className="absolute left-4 h-4 w-4 text-[#D4820A] animate-spin"/>
              : <Search className="absolute left-4 h-4 w-4 text-white/30"/>}
            <input autoFocus type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Song title or artist…"
              className="w-full rounded-2xl border border-white/8 bg-white/5 pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4820A]/50 focus:ring-2 focus:ring-[#D4820A]/20"/>
            {query && (
              <button onClick={clear} className="absolute right-3 p-1 text-white/30 hover:text-white">
                <X className="h-4 w-4"/>
              </button>
            )}
          </div>
        )}

        {status === "processing" && (
          <div className="rounded-3xl border border-white/8 bg-[#13131E] p-6 space-y-4">
            {song && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <Music className="h-8 w-8 text-white/20"/>
                <div>
                  <p className="text-sm font-semibold text-white">{song.title}</p>
                  <p className="text-xs text-white/40">{song.artist}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-[#D4820A] text-center">{step || "Analysing…"}</p>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-[#D4820A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        )}

        {status === "complete" && result && (
          <AnalysisResult result={result as unknown as SATBResult} onReset={reset}/>
        )}

        {status === "failed" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm">{error}</p>
              <button onClick={reset} className="text-xs text-[#7F77DD] mt-2">Try again</button>
            </div>
          </div>
        )}

        {!busy && results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-[#13131E]">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Music className="h-5 w-5 text-white/20"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{r.title}</p>
              <p className="text-xs text-white/40 truncate">{r.artist}</p>
            </div>
            <button onClick={() => handleAnalyse(r)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D4820A]/15 border border-[#D4820A]/30 text-[#D4820A] text-xs font-semibold hover:bg-[#D4820A]/25 transition-all">
              <Sparkles className="h-3.5 w-3.5"/>Analyse
            </button>
          </div>
        ))}

        {!busy && query.length >= 2 && !loading && results.length === 0 && (
          <p className="text-center text-sm text-white/30 py-8">No results for &ldquo;{query}&rdquo;</p>
        )}
        {!busy && !query && (
          <div className="text-center py-12 space-y-2">
            <Search className="h-10 w-10 text-white/10 mx-auto"/>
            <p className="text-sm text-white/30">Search any song to get SATB voice parts</p>
          </div>
        )}
      </div>
    </div>
  );
}

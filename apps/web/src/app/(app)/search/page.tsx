"use client";

import { PageHeader }        from "@/components/layout/PageHeader";
import { SearchBar }         from "@/components/search/SearchBar";
import { SearchResultCard }  from "@/components/search/SearchResultCard";
import { SearchLoader }      from "@/components/search/SearchLoader";
import { AnalysisResult }    from "@/components/analyse/AnalysisResult";
import { useSearch }         from "@/hooks/useSearch";
import { useSearchAnalysis } from "@/hooks/useSearchAnalysis";
import { Spinner, EmptyState } from "@/components/ui/index";
import { Card }              from "@/components/ui/Card";
import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { api }               from "@/lib/api";
import type { SATBResult, SearchResult } from "@partora/types";

interface RecentSong {
  id: string; title: string; artist?: string;
  key: string; mode: string; artwork_url?: string;
}

export default function SearchPage() {
  const { query, results, loading: searching, error: searchError, setQuery, clear } = useSearch();
  const { status, progress, step, result, error: analysisError, song, analyseSong, reset } = useSearchAnalysis();

  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);

  useEffect(() => {
    api.get<RecentSong[]>("/api/search/recent")
      .then((res) => { if (res.success && res.data) setRecentSongs(res.data); });
  }, []);

  const isIdle       = status === "idle";
  const isProcessing = status === "pending" || status === "processing";
  const isComplete   = status === "complete";
  const isFailed     = status === "failed";

  // When analysis starts, clear the search
  function handleAnalyse(s: SearchResult) {
    clear();
    analyseSong(s);
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Search Songs" subtitle="Find any song by name or artist" />

      <div className="px-5 pb-10 space-y-5">

        {/* Search input — always visible unless processing/complete */}
        {(isIdle || isFailed) && (
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clear}
            loading={searching}
            autoFocus
          />
        )}

        {/* Search results list */}
        {isIdle && query.length >= 2 && (
          <div className="space-y-2">
            {searching && results.length === 0 && (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            )}

            {!searching && results.length === 0 && !searchError && (
              <EmptyState
                emoji="🔍"
                title="No results found"
                description={`No songs found for "${query}". Try a different search.`}
              />
            )}

            {searchError && (
              <p className="text-sm text-red-400 text-center">{searchError}</p>
            )}

            {results.map((r, i) => (
              <SearchResultCard
                key={`${r.title}-${r.artist}-${i}`}
                result={r}
                onAnalyse={handleAnalyse}
              />
            ))}
          </div>
        )}

        {/* Recent searches (shown when search is empty) */}
        {isIdle && query.length < 2 && recentSongs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              <span>Recently analysed</span>
            </div>
            <div className="space-y-2">
              {recentSongs.map((s) => (
                <SearchResultCard
                  key={s.id}
                  result={{
                    title:      s.title,
                    artist:     s.artist ?? "",
                    artwork_url: s.artwork_url,
                  }}
                  onAnalyse={handleAnalyse}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no query and no recent */}
        {isIdle && query.length < 2 && recentSongs.length === 0 && (
          <EmptyState
            emoji="🎵"
            title="Search any song"
            description="Type a song title or artist name — we'll find it and generate all four SATB voice parts with tonic solfa."
          />
        )}

        {/* Processing */}
        {isProcessing && (
          <Card variant="elevated" padding="lg">
            <SearchLoader progress={progress} step={step} song={song} />
          </Card>
        )}

        {/* Complete */}
        {isComplete && result && (
          <AnalysisResult
            result={result as unknown as SATBResult}
            onReset={reset}
          />
        )}

        {/* Failed */}
        {isFailed && (
          <Card variant="flat" padding="md">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Analysis failed</p>
                <p className="text-xs text-muted">
                  {analysisError ?? "Something went wrong. Please try again."}
                </p>
                <button onClick={reset} className="text-xs text-soprano hover:text-soprano/80 underline transition-colors">
                  Try again
                </button>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

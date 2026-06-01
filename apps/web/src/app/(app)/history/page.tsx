"use client";

import { useEffect, useMemo }   from "react";
import { PageHeader }            from "@/components/layout/PageHeader";
import { SongCard }              from "@/components/layout/SongCard";
import { Spinner, EmptyState }   from "@/components/ui/index";
import { Button }                from "@/components/ui/Button";
import { useHistory }            from "@/hooks/useHistory";
import Link                      from "next/link";

function groupByDate(songs: ReturnType<typeof useHistory>["songs"]) {
  const groups: Record<string, typeof songs> = {};
  songs.forEach((s) => {
    const date = new Date(s.created_at);
    const today    = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric",
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
}

export default function HistoryPage() {
  const { songs, loading, error, hasMore, load, loadMore } = useHistory();

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => groupByDate(songs), [songs]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="History"
        subtitle="All your analysed songs"
        backHref="/library"
      />

      <div className="px-5 pb-10 space-y-6">

        {/* Loading initial */}
        {loading && songs.length === 0 && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center py-8">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && songs.length === 0 && (
          <EmptyState
            emoji="🎵"
            title="No history yet"
            description="Songs you analyse will appear here"
            action={
              <Link href="/">
                <Button variant="primary" size="sm">Analyse a song</Button>
              </Link>
            }
          />
        )}

        {/* Grouped song list */}
        {Object.entries(grouped).map(([label, group]) => (
          <section key={label} aria-label={label}>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
              {label}
            </h2>
            <div className="space-y-2">
              {group.map((s) => (
                <SongCard
                  key={s.song_id}
                  title={s.title}
                  artist={s.artist}
                  artworkUrl={s.artwork_url}
                  keyStr={s.key}
                  mode={s.mode}
                  source={s.source}
                  href={`/analyse/${s.song_id}`}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadMore}
              loading={loading}
            >
              Load more
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

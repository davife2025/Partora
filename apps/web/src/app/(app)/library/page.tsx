"use client";

import { useState, useMemo }  from "react";
import { PageHeader }         from "@/components/layout/PageHeader";
import { LibraryFilter }      from "@/components/library/LibraryFilter";
import { LibrarySongCard }    from "@/components/library/LibrarySongCard";
import { LibraryStats }       from "@/components/library/LibraryStats";
import { Spinner, EmptyState } from "@/components/ui/index";
import { Input }              from "@/components/ui/FormFields";
import { Button }             from "@/components/ui/Button";
import { useLibrary }         from "@/hooks/useLibrary";
import { useToast }           from "@/components/ui/Toast";
import { Search }             from "lucide-react";
import Link                   from "next/link";

type FilterSource = "all" | "lyrics" | "upload" | "search" | "record";

export default function LibraryPage() {
  const { songs, loading, error, fetchLibrary, deleteSong } = useLibrary();
  const { success, error: showError } = useToast();
  const [filter,    setFilter]    = useState<FilterSource>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Count by source
  const counts = useMemo(() => {
    const c: Partial<Record<FilterSource, number>> = {};
    songs.forEach((s) => {
      const src = s.source as FilterSource;
      c[src] = (c[src] ?? 0) + 1;
    });
    return c;
  }, [songs]);

  // Filter + search
  const filtered = useMemo(() => {
    return songs.filter((s) => {
      const matchesSource = filter === "all" || s.source === filter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        s.title.toLowerCase().includes(q) ||
        (s.artist ?? "").toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q);
      return matchesSource && matchesSearch;
    });
  }, [songs, filter, searchQuery]);

  async function handleDelete(id: string) {
    const ok = await deleteSong(id);
    if (ok) success("Song deleted");
    else showError("Could not delete — please try again");
    return ok;
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Library"
        subtitle={`${songs.length} song${songs.length !== 1 ? "s" : ""} analysed`}
      />

      <div className="px-5 pb-10 space-y-4">

        {/* Stats */}
        {songs.length > 0 && (
          <LibraryStats
            total={songs.length}
            bySource={counts as Record<string, number>}
          />
        )}

        {/* Search */}
        {songs.length > 3 && (
          <Input
            name="search"
            placeholder="Search by title, artist or key…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="h-4 w-4" />}
          />
        )}

        {/* Filter tabs */}
        {songs.length > 0 && (
          <LibraryFilter
            active={filter}
            onChange={setFilter}
            counts={counts}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchLibrary}>
              Try again
            </Button>
          </div>
        )}

        {/* Empty state — no songs at all */}
        {!loading && !error && songs.length === 0 && (
          <EmptyState
            emoji="🎵"
            title="Your library is empty"
            description="Analyse your first song to see it here. Try typing lyrics, uploading a file, searching, or recording."
            action={
              <Link href="/">
                <Button variant="primary" size="sm">Analyse a song</Button>
              </Link>
            }
          />
        )}

        {/* Empty state — filter returns nothing */}
        {!loading && !error && songs.length > 0 && filtered.length === 0 && (
          <EmptyState
            emoji="🔍"
            title="No matches"
            description={searchQuery ? `No songs matching "${searchQuery}"` : "No songs in this category"}
            action={
              <Button variant="ghost" size="sm" onClick={() => { setFilter("all"); setSearchQuery(""); }}>
                Clear filters
              </Button>
            }
          />
        )}

        {/* Song list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((song) => (
              <LibrarySongCard
                key={song.id}
                song={song}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

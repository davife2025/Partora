import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { SongCard } from "@/components/layout/SongCard";
import { EmptyState } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: songs } = await supabase
    .from("songs")
    .select("id, title, artist, key, mode, artwork_url, source, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Library" subtitle={`${songs?.length ?? 0} songs analysed`} />
      <div className="px-5 space-y-2">
        {!songs || songs.length === 0 ? (
          <EmptyState
            emoji="🎵"
            title="No songs yet"
            description="Analyse your first song to see it here"
            action={
              <Link href="/">
                <Button variant="primary" size="sm">Analyse a song</Button>
              </Link>
            }
          />
        ) : (
          songs.map((song) => (
            <SongCard
              key={song.id}
              title={song.title}
              artist={song.artist}
              artworkUrl={song.artwork_url}
              keyStr={song.key}
              mode={song.mode}
              source={song.source}
              href={`/analyse/${song.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

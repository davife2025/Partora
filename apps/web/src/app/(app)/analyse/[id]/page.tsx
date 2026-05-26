import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SATBCardGrid } from "@/components/solfa/VoicePartCard";
import { Badge } from "@/components/ui/index";
import type { Metadata } from "next";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("songs")
    .select("title, artist")
    .eq("id", params.id)
    .single();
  return { title: data ? `${data.title}${data.artist ? ` — ${data.artist}` : ""}` : "Analysis" };
}

export default async function ResultPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: satb } = await supabase
    .from("satb_results")
    .select("*, songs(title, artist, key, mode, artwork_url, source)")
    .eq("song_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!satb) notFound();

  const song = satb.songs as { title: string; artist?: string; key: string; mode: string };

  return (
    <div>
      <PageHeader
        title={song.title}
        subtitle={song.artist ?? undefined}
        backHref="/library"
      />

      <div className="px-5 pb-10 space-y-5">
        {/* Key info */}
        <div className="flex items-center gap-2">
          <Badge variant="soprano">{song.key} {song.mode}</Badge>
          <Badge variant="default">SATB harmonisation</Badge>
        </div>

        {/* SATB cards */}
        <SATBCardGrid
          soprano={satb.soprano_data}
          alto={satb.alto_data}
          tenor={satb.tenor_data}
          bass={satb.bass_data}
        />
      </div>
    </div>
  );
}

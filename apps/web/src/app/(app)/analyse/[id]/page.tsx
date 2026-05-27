import { createClient }      from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PageHeader }         from "@/components/layout/PageHeader";
import { SATBCardGrid }       from "@/components/solfa/VoicePartCard";
import { Badge }              from "@/components/ui/index";
import { ShareResultButton }  from "@/components/library/ShareResultButton";
import { SolfaPDFExport }     from "@/components/library/SolfaPDFExport";
import type { Metadata }      from "next";
import type { VoicePartResult } from "@partora/types";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("songs")
    .select("title, artist")
    .eq("id", params.id)
    .single();
  return {
    title:       data ? `${data.title}${data.artist ? ` — ${data.artist}` : ""}` : "Analysis",
    description: "SATB harmonisation and tonic solfa from Partora",
    openGraph: {
      title:       data?.title ?? "Partora Analysis",
      description: "View tonic solfa for all four SATB voice parts",
      siteName:    "Partora",
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: satb } = await supabase
    .from("satb_results")
    .select("*, songs(title, artist, key, mode, artwork_url, source, lyrics)")
    .eq("song_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!satb) notFound();

  const song = satb.songs as {
    title: string; artist?: string;
    key: string; mode: string;
  };

  return (
    <div>
      <PageHeader
        title={song.title}
        subtitle={song.artist ?? undefined}
        backHref="/library"
        actions={
          <div className="flex items-center gap-2">
            <SolfaPDFExport
              songTitle={song.title}
              artist={song.artist}
              musicalKey={song.key}
              mode={song.mode}
              soprano={satb.soprano_data as VoicePartResult}
              alto={satb.alto_data       as VoicePartResult}
              tenor={satb.tenor_data     as VoicePartResult}
              bass={satb.bass_data       as VoicePartResult}
            />
            <ShareResultButton
              songId={params.id}
              songTitle={song.title}
            />
          </div>
        }
      />

      <div className="px-5 pb-10 space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="soprano">{song.key} {song.mode}</Badge>
          <Badge variant="default">SATB harmonisation</Badge>
        </div>

        <SATBCardGrid
          soprano={satb.soprano_data as VoicePartResult}
          alto={satb.alto_data       as VoicePartResult}
          tenor={satb.tenor_data     as VoicePartResult}
          bass={satb.bass_data       as VoicePartResult}
          resultId={satb.id}
          songTitle={song.title}
          artist={song.artist}
          musicalKey={song.key}
          mode={song.mode}
        />
      </div>
    </div>
  );
}

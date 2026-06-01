import { createClient }      from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PageHeader }         from "@/components/layout/PageHeader";
import { SATBCardGrid }       from "@/components/solfa/VoicePartCard";
import type { Metadata, ResolvingMetadata } from "next";
import type { VoicePartResult } from "@partora/types";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from("songs").select("title,artist").eq("id", params.id).single();
  return { title: data ? `${data.title}${data.artist ? ` — ${data.artist}` : ""}` : "Analysis" };
}

export default async function ResultPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: satb } = await supabase
    .from("satb_results")
    .select("*, songs(title,artist,key,mode)")
    .eq("song_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!satb) notFound();

  const song = satb.songs as { title:string; artist?:string; key:string; mode:string };

  async function shareAction() {
    "use server";
  }

  return (
    <div>
      <PageHeader title={song.title} subtitle={song.artist} backHref="/library"
        actions={
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium"
                style={{color:"#7F77DD",borderColor:"#7F77DD40",background:"#7F77DD15"}}>
            {song.key} {song.mode}
          </span>
        }
      />
      <div className="px-5 pb-10">
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Mic, Search, Upload, PenLine, BookOpen, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/index";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

const INPUT_MODES = [
  {
    href:    "/analyse",
    emoji:   <PenLine className="h-5 w-5" />,
    label:   "Type Lyrics",
    desc:    "Paste lyrics + pick a key",
    variant: "soprano" as const,
    badge:   "Quick",
  },
  {
    href:    "/upload",
    emoji:   <Upload className="h-5 w-5" />,
    label:   "Upload Audio",
    desc:    "Any MP3, WAV or AAC file",
    variant: "alto" as const,
    badge:   "Auto key",
  },
  {
    href:    "/search",
    emoji:   <Search className="h-5 w-5" />,
    label:   "Search a Song",
    desc:    "Find any song by name",
    variant: "tenor" as const,
    badge:   "Catalogue",
  },
  {
    href:    "/record",
    emoji:   <Mic className="h-5 w-5" />,
    label:   "Record Live",
    desc:    "Hum or sing a snippet",
    variant: "bass" as const,
    badge:   "Live",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, preferred_voice_part")
    .eq("id", user!.id)
    .single();

  const { data: recentSongs } = await supabase
    .from("songs")
    .select("id, title, artist, key, mode, artwork_url, source")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="px-5 pb-6 space-y-6">
      {/* Greeting */}
      <div className="pt-6">
        <p className="text-muted text-sm">Good to see you,</p>
        <h1 className="text-2xl font-semibold text-white mt-0.5">
          {firstName} 👋
        </h1>
        {profile?.preferred_voice_part && (
          <Badge variant={profile.preferred_voice_part as "soprano" | "alto" | "tenor" | "bass"} className="mt-2 capitalize">
            {profile.preferred_voice_part}
          </Badge>
        )}
      </div>

      {/* Input mode grid */}
      <section aria-label="How would you like to analyse a song?">
        <h2 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">
          Analyse a song
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {INPUT_MODES.map((mode) => (
            <Link key={mode.href} href={mode.href}>
              <Card
                variant={mode.variant}
                hoverable
                className="h-full"
              >
                <div className="flex flex-col h-full gap-3">
                  <div className="flex items-start justify-between">
                    <span className={`text-${mode.variant}`}>{mode.emoji}</span>
                    <Badge variant={mode.variant} className="text-[10px]">{mode.badge}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{mode.label}</p>
                    <p className="text-xs text-muted mt-0.5">{mode.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent songs */}
      {recentSongs && recentSongs.length > 0 && (
        <section aria-label="Recent songs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
              Recent
            </h2>
            <Link
              href="/library"
              className="text-xs text-soprano hover:text-soprano/80 flex items-center gap-0.5 transition-colors"
            >
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSongs.map((song) => (
              <Link
                key={song.id}
                href={`/analyse/${song.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border
                           bg-background-secondary hover:bg-background-tertiary
                           transition-all duration-150 active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-background-tertiary flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  {song.artist && <p className="text-xs text-muted truncate">{song.artist}</p>}
                </div>
                <Badge variant="soprano" className="text-[10px] shrink-0">
                  {song.key} {song.mode}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

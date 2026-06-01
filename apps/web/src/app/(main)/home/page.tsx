import Link          from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Music, PenLine, Upload, Search, Mic, BookOpen, MessageCircle, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

const PART_COLORS: Record<string, string> = {
  soprano: "#7F77DD", alto: "#2DA882", tenor: "#D4820A", bass: "#185FA5",
};

const INPUT_MODES = [
  { href: "/analyse", icon: PenLine,  label: "Type Lyrics",   desc: "Paste lyrics + pick key",  color: "#7F77DD", bg: "rgba(127,119,221,0.1)",  border: "rgba(127,119,221,0.2)" },
  { href: "/upload",  icon: Upload,   label: "Upload Audio",  desc: "MP3, WAV, AAC — 50MB max", color: "#2DA882", bg: "rgba(45,168,130,0.1)",   border: "rgba(45,168,130,0.2)"  },
  { href: "/search",  icon: Search,   label: "Search a Song", desc: "Find any song by name",    color: "#D4820A", bg: "rgba(212,130,10,0.1)",   border: "rgba(212,130,10,0.2)"  },
  { href: "/record",  icon: Mic,      label: "Record Live",   desc: "Hum or sing a snippet",    color: "#185FA5", bg: "rgba(24,95,165,0.1)",    border: "rgba(24,95,165,0.2)"   },
];

const QUICK_LINKS = [
  { href: "/library", icon: BookOpen,      label: "My Library",   desc: "Saved analyses" },
  { href: "/coach",   icon: MessageCircle, label: "Voice Coach",  desc: "Ask AI anything" },
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
    .limit(4);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const vp = profile?.preferred_voice_part as string | undefined;

  return (
    <div className="px-5 pb-6 space-y-7">
      {/* Greeting */}
      <div className="pt-6">
        <p className="text-sm text-white/40">Welcome back,</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">{firstName} 👋</h1>
        {vp && (
          <span className="inline-flex mt-2 text-xs px-2.5 py-1 rounded-full border font-medium capitalize"
                style={{ color: PART_COLORS[vp], borderColor: PART_COLORS[vp]+"40", background: PART_COLORS[vp]+"15" }}>
            {vp}
          </span>
        )}
      </div>

      {/* Input mode grid */}
      <section>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Analyse a song</p>
        <div className="grid grid-cols-2 gap-3">
          {INPUT_MODES.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
            <Link key={href} href={href}>
              <div
                className="rounded-2xl border p-4 space-y-3 h-full transition-all active:scale-95 hover:brightness-110"
                style={{ background: bg, borderColor: border }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background: color+"25" }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: color+"99" }}>{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4 flex items-center gap-3
                            transition-all active:scale-95 hover:bg-white/5">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-white/50" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{label}</p>
                <p className="text-xs text-white/30 truncate">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent songs */}
      {recentSongs && recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Recent</p>
            <Link href="/library" className="text-xs text-[#7F77DD] hover:text-[#9B95E8] flex items-center gap-0.5 transition-colors">
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSongs.map((song) => {
              const keyColor = "#7F77DD";
              return (
                <Link key={song.id} href={`/analyse/${song.id}`}>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8
                                  bg-white/3 hover:bg-white/5 transition-all active:scale-[0.98]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Music className="h-4 w-4 text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{song.title}</p>
                      {song.artist && <p className="text-xs text-white/30 truncate">{song.artist}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0"
                          style={{ color: keyColor, borderColor: keyColor+"40", background: keyColor+"15" }}>
                      {song.key} {song.mode}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!recentSongs || recentSongs.length === 0) && (
        <div className="rounded-3xl border border-white/8 bg-white/2 p-8 text-center space-y-3">
          <div className="text-4xl">🎵</div>
          <p className="text-sm font-medium text-white">Analyse your first song</p>
          <p className="text-xs text-white/30">Choose any input mode above to get started</p>
        </div>
      )}
    </div>
  );
}

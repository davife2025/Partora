import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, preferred_voice_part")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="p-6 space-y-6">
      <div className="pt-4">
        <h1 className="text-2xl font-semibold text-white">
          Hey, {firstName} 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          What song are we learning today?
        </p>
      </div>

      {/* Input mode cards — implemented in Sessions 4–7 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Type lyrics",   emoji: "✍️",  href: "/analyse",  color: "bg-voice-soprano" },
          { label: "Upload audio",  emoji: "🎵",  href: "/upload",   color: "bg-voice-alto" },
          { label: "Search a song", emoji: "🔍",  href: "/search",   color: "bg-voice-tenor" },
          { label: "Record live",   emoji: "🎤",  href: "/record",   color: "bg-voice-bass" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`glass glass-hover p-5 rounded-2xl border flex flex-col gap-3 ${item.color}`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-sm font-medium text-white">{item.label}</span>
          </a>
        ))}
      </div>

      <div className="glass p-4 rounded-2xl border text-center text-muted text-sm">
        Full UI implemented in Session 3 · Features in Sessions 4–7
      </div>
    </div>
  );
}

"use client";
import { useState, useMemo, useEffect } from "react";
import { PageHeader }   from "@/components/layout/PageHeader";
import { useLibrary }   from "@/hooks/useLibrary";
import { useToast }     from "@/components/ui/Toast";
import Link from "next/link";
import { Music, Trash2, Share2, Search, BookOpen } from "lucide-react";

const SOURCES = ["all","lyrics","upload","search","record"] as const;
const SRC_ICON: Record<string,string> = { lyrics:"✍️", upload:"🎵", search:"🔍", record:"🎤" };
const COLORS: Record<string,string> = { soprano:"#7F77DD", alto:"#2DA882", tenor:"#D4820A", bass:"#185FA5" };

export default function LibraryPage() {
  const { songs, loading, deleteSong } = useLibrary();
  const { success, error } = useToast();
  const [filter, setFilter] = useState<typeof SOURCES[number]>("all");
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string|null>(null);

  const filtered = useMemo(() => songs.filter(s => {
    const src = filter === "all" || s.source === filter;
    const search = !q || s.title.toLowerCase().includes(q.toLowerCase()) || (s.artist??"").toLowerCase().includes(q.toLowerCase());
    return src && search;
  }), [songs, filter, q]);

  async function handleDelete(id: string) {
    if (confirm !== id) { setConfirm(id); setTimeout(()=>setConfirm(null),3000); return; }
    const ok = await deleteSong(id);
    if (ok) success("Deleted"); else error("Could not delete");
    setConfirm(null);
  }

  async function handleShare(id: string, title: string, e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.origin}/analyse/${id}`;
    if (navigator.share) await navigator.share({ title, url });
    else { await navigator.clipboard.writeText(url); success("Link copied!"); }
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Library" subtitle={`${songs.length} songs`}/>
      <div className="px-5 pb-10 space-y-4">

        {songs.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
              className="w-full rounded-2xl border border-white/8 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"/>
          </div>
        )}

        {songs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SOURCES.map(s => (
              <button key={s} onClick={()=>setFilter(s)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${filter===s ? "bg-[#7F77DD]/20 border-[#7F77DD]/40 text-[#7F77DD]" : "border-white/8 text-white/30 hover:text-white"}`}>
                {s === "all" ? "All" : `${SRC_ICON[s]} ${s}`}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="text-center py-12 text-white/30 text-sm">Loading…</div>}

        {!loading && songs.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="h-12 w-12 text-white/10 mx-auto"/>
            <p className="text-sm text-white/30">No songs yet — analyse one to see it here</p>
            <Link href="/home" className="inline-block text-xs text-[#7F77DD] hover:text-[#9B95E8]">Go analyse →</Link>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(s => (
            <Link key={s.id} href={`/analyse/${s.id}`}>
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-[#13131E] hover:bg-white/3 active:scale-[0.98] transition-all group">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Music className="h-4 w-4 text-white/20"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                  {s.artist && <p className="text-xs text-white/30 truncate">{s.artist}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                      style={{color:"#7F77DD",borderColor:"#7F77DD40",background:"#7F77DD15"}}>
                      {s.key} {s.mode}
                    </span>
                    <span className="text-[10px] text-white/20">{SRC_ICON[s.source]} {s.source}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e=>{e.preventDefault();handleShare(s.id,s.title,e);}}
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                    <Share2 className="h-3.5 w-3.5"/>
                  </button>
                  <button onClick={e=>{e.preventDefault();handleDelete(s.id);}}
                    className={`p-2 rounded-lg transition-all ${confirm===s.id?"text-red-400 bg-red-500/10":"text-white/30 hover:text-red-400 hover:bg-white/5"}`}>
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filtered.length === 0 && songs.length > 0 && (
          <p className="text-center text-sm text-white/30 py-8">No matches</p>
        )}
      </div>
    </div>
  );
}

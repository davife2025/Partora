"use client";

import Image from "next/image";
import Link  from "next/link";
import { useState } from "react";
import { Music, Trash2, Share2, ChevronRight } from "lucide-react";
import { cn }   from "@/lib/utils";
import { Badge } from "@/components/ui/index";
import type { LibrarySong } from "@/hooks/useLibrary";

const SOURCE_ICONS: Record<string, string> = {
  lyrics: "✍️", upload: "🎵", search: "🔍", record: "🎤",
};

interface LibrarySongCardProps {
  song:      LibrarySong;
  onDelete:  (id: string) => Promise<boolean>;
  className?: string;
}

export function LibrarySongCard({ song, onDelete, className }: LibrarySongCardProps) {
  const [deleting, setDeleting]   = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await onDelete(song.id);
    setDeleting(false);
    setConfirming(false);
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.origin}/analyse/${song.id}`;
    if (navigator.share) await navigator.share({ title: song.title, url });
    else await navigator.clipboard.writeText(url);
  }

  const formattedDate = new Date(song.created_at).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link href={`/analyse/${song.id}`}>
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border border-border",
        "bg-background-secondary hover:bg-background-tertiary",
        "transition-all duration-150 active:scale-[0.98] group",
        deleting && "opacity-50 pointer-events-none",
        className
      )}>
        {/* Artwork */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background-tertiary flex items-center justify-center">
          {song.artwork_url
            ? <Image src={song.artwork_url} alt={song.title} width={48} height={48} className="object-cover w-full h-full" />
            : <Music className="h-5 w-5 text-muted" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{song.title}</p>
          {song.artist && <p className="text-xs text-muted truncate mt-0.5">{song.artist}</p>}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant="soprano" className="text-[10px]">{song.key} {song.mode}</Badge>
            <Badge variant="default" className="text-[10px]">
              {SOURCE_ICONS[song.source]} {song.source}
            </Badge>
            <span className="text-[10px] text-muted">{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-background-primary transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              confirming
                ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                : "text-muted hover:text-red-400 hover:bg-background-primary"
            )}
            aria-label={confirming ? "Confirm delete" : "Delete"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <ChevronRight className="h-4 w-4 text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

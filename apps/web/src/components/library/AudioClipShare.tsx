"use client";

import { useState }          from "react";
import { Share2, Download }  from "lucide-react";
import { useToast }          from "@/components/ui/Toast";
import { cn }                from "@/lib/utils";
import type { VoicePart }    from "@partora/types";

const PART_LABELS: Record<VoicePart, string> = {
  soprano: "Soprano", alto: "Alto", tenor: "Tenor", bass: "Bass",
};

interface AudioClipShareProps {
  audioUrl:   string;
  voicePart:  VoicePart;
  songTitle:  string;
  className?: string;
}

export function AudioClipShare({
  audioUrl, voicePart, songTitle, className,
}: AudioClipShareProps) {
  const [sharing, setSharing] = useState(false);
  const { success, error }    = useToast();

  async function handleShare() {
    setSharing(true);
    try {
      // Fetch the audio as a blob for native sharing
      const res   = await fetch(audioUrl);
      const blob  = await res.blob();
      const file  = new File(
        [blob],
        `${songTitle}-${voicePart}-solfa.mp3`,
        { type: "audio/mpeg" }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${songTitle} — ${PART_LABELS[voicePart]} part`,
          text:  `Tonic solfa for the ${PART_LABELS[voicePart]} part of "${songTitle}" from Partora`,
          files: [file],
        });
      } else {
        // Fallback — trigger download
        const link    = document.createElement("a");
        link.href     = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(link.href);
        success("Audio downloaded!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        error("Could not share audio");
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    const res   = await fetch(audioUrl);
    const blob  = await res.blob();
    const link  = document.createElement("a");
    link.href     = URL.createObjectURL(blob);
    link.download = `${songTitle}-${voicePart}-solfa.mp3`;
    link.click();
    URL.revokeObjectURL(link.href);
    success(`${PART_LABELS[voicePart]} audio downloaded`);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
        aria-label={`Download ${voicePart} audio`}
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors disabled:opacity-50"
        aria-label={`Share ${voicePart} audio`}
      >
        <Share2 className="h-3.5 w-3.5" />
        {sharing ? "Sharing…" : "Share clip"}
      </button>
    </div>
  );
}

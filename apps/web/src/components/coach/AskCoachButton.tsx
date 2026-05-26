"use client";

import { useRouter }      from "next/navigation";
import { MessageCircle }  from "lucide-react";
import { Button }         from "@/components/ui/Button";
import type { VoicePart } from "@partora/types";

interface AskCoachButtonProps {
  songTitle?:  string;
  artist?:     string;
  key?:        string;
  mode?:       string;
  voicePart?:  VoicePart;
  solfaText?:  string;
  size?:       "sm" | "md";
}

export function AskCoachButton({
  songTitle, artist, key, mode, voicePart, solfaText, size = "sm",
}: AskCoachButtonProps) {
  const router = useRouter();

  function handleClick() {
    const params = new URLSearchParams();
    if (voicePart) params.set("voice_part", voicePart);
    if (songTitle) params.set("song_title",  songTitle);
    if (artist)    params.set("artist",       artist);
    if (key)       params.set("key",          key);
    if (mode)      params.set("mode",         mode);
    if (solfaText) params.set("solfa_text",   solfaText);
    router.push(`/coach?${params.toString()}`);
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className="gap-1.5"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      Ask Coach
    </Button>
  );
}

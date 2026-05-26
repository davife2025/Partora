import Image from "next/image";
import { Music, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/index";

interface RecognisedSongBannerProps {
  title:       string;
  artist:      string;
  artworkUrl?: string;
  confidence?: "high" | "medium" | "low";
}

const CONFIDENCE_BADGE = {
  high:   { variant: "success" as const,  label: "High confidence" },
  medium: { variant: "warning" as const,  label: "Medium confidence" },
  low:    { variant: "danger"  as const,  label: "Low confidence" },
};

export function RecognisedSongBanner({
  title, artist, artworkUrl, confidence = "high",
}: RecognisedSongBannerProps) {
  const badge = CONFIDENCE_BADGE[confidence];

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-green-500/20 bg-green-500/5">
      {/* Artwork */}
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background-tertiary">
        {artworkUrl
          ? <Image src={artworkUrl} alt={title} width={48} height={48} className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Music className="h-5 w-5 text-muted" />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
          <p className="text-xs text-green-400 font-medium">Song identified</p>
        </div>
        <p className="text-sm font-semibold text-white truncate mt-0.5">{title}</p>
        <p className="text-xs text-muted truncate">{artist}</p>
      </div>

      <Badge variant={badge.variant} className="shrink-0 text-[10px]">
        {badge.label}
      </Badge>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Music, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/index";

interface SongCardProps {
  title: string;
  artist?: string;
  artworkUrl?: string;
  keyStr?: string;
  mode?: string;
  source?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

export function SongCard({
  title, artist, artworkUrl, keyStr, mode,
  source, href, onClick, trailing, className,
}: SongCardProps) {
  const inner = (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-2xl border border-border",
      "bg-background-secondary transition-all duration-150",
      (href || onClick) && "hover:border-border hover:bg-background-tertiary active:scale-[0.98] cursor-pointer",
      className
    )}>
      {/* Artwork */}
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-background-tertiary flex items-center justify-center">
        {artworkUrl ? (
          <Image src={artworkUrl} alt={title} width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <Music className="h-5 w-5 text-muted" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        {artist && <p className="text-xs text-muted truncate mt-0.5">{artist}</p>}
        <div className="flex items-center gap-1.5 mt-1.5">
          {keyStr && (
            <Badge variant="soprano" className="text-[10px] py-0 px-1.5">
              {keyStr} {mode}
            </Badge>
          )}
          {source && (
            <Badge variant="default" className="text-[10px] py-0 px-1.5 capitalize">
              {source}
            </Badge>
          )}
        </div>
      </div>

      {/* Trailing */}
      {trailing ?? ((href || onClick) && <ChevronRight className="h-4 w-4 text-muted shrink-0" />)}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()}>{inner}</div>;
  return inner;
}

import { Badge } from "@/components/ui/index";

interface AudioKeyBadgeProps {
  musicalKey: string;
  mode:       string;
  confidence?: number;
}

export function AudioKeyBadge({ musicalKey, mode, confidence }: AudioKeyBadgeProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="alto" className="text-sm px-3 py-1">
        {musicalKey} {mode}
      </Badge>
      {confidence !== undefined && (
        <Badge
          variant={confidence >= 0.7 ? "success" : confidence >= 0.4 ? "warning" : "danger"}
          className="text-xs"
        >
          {Math.round(confidence * 100)}% confidence
        </Badge>
      )}
      <Badge variant="default" className="text-xs">Auto-detected</Badge>
    </div>
  );
}

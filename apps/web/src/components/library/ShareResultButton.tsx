"use client";

import { useState }    from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button }      from "@/components/ui/Button";
import { Modal }       from "@/components/ui/Modal";
import { useToast }    from "@/components/ui/Toast";

interface ShareResultButtonProps {
  songId:    string;
  songTitle: string;
  variant?:  "icon" | "full";
}

export function ShareResultButton({ songId, songTitle, variant = "icon" }: ShareResultButtonProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/analyse/${songId}`
    : `/analyse/${songId}`;

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title: `Partora — ${songTitle}`, url: shareUrl });
      setOpen(false);
    } else {
      setOpen(true);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {variant === "icon" ? (
        <Button variant="ghost" size="icon" onClick={handleNativeShare} aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={handleNativeShare} className="gap-2">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Share analysis">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Anyone with this link can view the SATB harmonisation for <strong className="text-white">{songTitle}</strong>.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-background-tertiary border border-border">
            <p className="text-xs text-muted flex-1 truncate font-mono">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded-lg hover:bg-background-secondary transition-colors"
              aria-label="Copy link"
            >
              {copied
                ? <Check className="h-4 w-4 text-green-400" />
                : <Copy  className="h-4 w-4 text-muted"     />
              }
            </button>
          </div>
          <Button variant="primary" fullWidth onClick={handleCopy}>
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

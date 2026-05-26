"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Music, X, FileAudio } from "lucide-react";
import { Input } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ACCEPTED = ".mp3,.wav,.aac,.ogg,.flac,.webm";
const MAX_MB   = 50;

interface AudioDropzoneProps {
  onUpload: (file: File, meta: { title?: string; artist?: string }) => void;
  loading?: boolean;
}

export function AudioDropzone({ onUpload, loading }: AudioDropzoneProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [file,    setFile]    = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [title,   setTitle]   = useState("");
  const [artist,  setArtist]  = useState("");
  const [error,   setError]   = useState("");

  const handleFile = useCallback((f: File) => {
    setError("");
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large — maximum ${MAX_MB} MB`);
      return;
    }
    if (!f.type.startsWith("audio/")) {
      setError("Please upload an audio file (MP3, WAV, AAC, FLAC, OGG)");
      return;
    }
    setFile(f);
    // Pre-fill title from filename
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  }, [title]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select an audio file"); return; }
    onUpload(file, { title: title || undefined, artist: artist || undefined });
  }

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload audio file"
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3",
          "rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200",
          file
            ? "border-alto/50 bg-voice-alto cursor-default"
            : dragging
              ? "border-soprano bg-voice-soprano scale-[1.01]"
              : "border-border bg-background-tertiary hover:border-soprano/50 hover:bg-background-secondary cursor-pointer"
        )}
      >
        {file ? (
          /* File selected state */
          <>
            <div className="relative">
              <FileAudio className="h-10 w-10 text-alto" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setError(""); }}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-background-secondary border border-border
                           text-muted hover:text-white transition-colors"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-muted mt-0.5">{formatSize(file.size)}</p>
            </div>
          </>
        ) : (
          /* Empty state */
          <>
            {dragging
              ? <Upload className="h-10 w-10 text-soprano animate-bounce" />
              : <Music  className="h-10 w-10 text-muted" />
            }
            <div>
              <p className="text-sm font-medium text-white">
                {dragging ? "Drop to upload" : "Drag & drop or tap to select"}
              </p>
              <p className="text-xs text-muted mt-1">MP3, WAV, AAC, FLAC, OGG · Max 50 MB</p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={onInputChange}
          aria-hidden
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {/* Optional metadata */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="title"
          placeholder="Song title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          name="artist"
          placeholder="Artist (optional)"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        disabled={!file}
        variant={file ? "primary" : "secondary"}
      >
        {file ? "Analyse Audio" : "Select a file first"}
      </Button>
    </form>
  );
}

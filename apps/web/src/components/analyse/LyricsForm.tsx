"use client";

import { useState } from "react";
import { Textarea, Input, Select } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Music2 } from "lucide-react";
import type { MusicalKey, MusicalMode, LyricsAnalysisRequest } from "@partora/types";

const KEY_OPTIONS: { value: string; label: string }[] = [
  { value: "",    label: "Select key…" },
  ...["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map((k) => ({ value: k, label: k })),
  ...(["Db","Eb","Gb","Ab","Bb"].map((k) => ({ value: k, label: `${k} (enharmonic)` }))),
];

const MODE_OPTIONS = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
];

interface LyricsFormProps {
  onSubmit: (data: LyricsAnalysisRequest & { title?: string; artist?: string }) => void;
  loading?: boolean;
}

export function LyricsForm({ onSubmit, loading }: LyricsFormProps) {
  const [lyrics,  setLyrics]  = useState("");
  const [key,     setKey]     = useState<MusicalKey | "">("");
  const [mode,    setMode]    = useState<MusicalMode>("major");
  const [title,   setTitle]   = useState("");
  const [artist,  setArtist]  = useState("");
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (lyrics.trim().length < 10) e.lyrics = "Please enter at least 10 characters of lyrics";
    if (!key)                        e.key    = "Please select the musical key";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    onSubmit({ lyrics: lyrics.trim(), key: key as MusicalKey, mode, title: title || undefined, artist: artist || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Song info (optional) */}
      <Card variant="flat" padding="md">
        <p className="text-xs text-muted uppercase tracking-wider font-medium mb-3">
          Song info <span className="normal-case font-normal">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="title"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            name="artist"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
      </Card>

      {/* Key + Mode */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Musical key"
          name="key"
          options={KEY_OPTIONS}
          value={key}
          onChange={(e) => setKey(e.target.value as MusicalKey)}
          error={errors.key}
        />
        <Select
          label="Mode"
          name="mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={(e) => setMode(e.target.value as MusicalMode)}
        />
      </div>

      {/* Lyrics */}
      <Textarea
        label="Lyrics"
        name="lyrics"
        placeholder={"Paste your song lyrics here…\n\nVerse 1:\nAmazing grace how sweet the sound…"}
        rows={10}
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        error={errors.lyrics}
        hint={`${lyrics.length} characters · ${lyrics.split(/\s+/).filter(Boolean).length} words`}
      />

      {/* Tips */}
      <Card variant="flat" padding="sm" className="text-xs text-muted space-y-1">
        <p className="flex items-center gap-1.5">
          <Music2 className="h-3 w-3 shrink-0" /> Label verse/chorus sections for better harmonisation
        </p>
        <p className="flex items-center gap-1.5">
          <Music2 className="h-3 w-3 shrink-0" /> Include all repeated sections even if identical
        </p>
      </Card>

      <Button type="submit" fullWidth loading={loading} size="lg">
        Generate SATB Parts
      </Button>
    </form>
  );
}

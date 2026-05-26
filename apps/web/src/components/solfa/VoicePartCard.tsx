"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Music2 } from "lucide-react";
import { cn }                  from "@/lib/utils";
import { AudioPlayer }         from "@/components/audio/AudioPlayer";
import { SolfaDisplay, SolfaText } from "@/components/solfa/SolfaDisplay";
import { Badge }               from "@/components/ui/index";
import { AskCoachButton }      from "@/components/coach/AskCoachButton";
import { SingGenerateButton }  from "@/components/sing/SingGenerateButton";
import { VoiceChangerPanel }   from "@/components/sing/VoiceChangerPanel";
import type { VoicePart, VoicePartResult } from "@partora/types";

const PART_META: Record<VoicePart, {
  label: string; emoji: string; range: string;
  cardClass: string; badgeVariant: "soprano"|"alto"|"tenor"|"bass";
}> = {
  soprano: { label: "Soprano", emoji: "🎶", range: "C4–A5", cardClass: "bg-voice-soprano border-soprano/30", badgeVariant: "soprano" },
  alto:    { label: "Alto",    emoji: "🎵", range: "G3–E5", cardClass: "bg-voice-alto border-alto/30",       badgeVariant: "alto"    },
  tenor:   { label: "Tenor",   emoji: "🎤", range: "C3–A4", cardClass: "bg-voice-tenor border-tenor/30",     badgeVariant: "tenor"   },
  bass:    { label: "Bass",    emoji: "🎸", range: "E2–E4", cardClass: "bg-voice-bass border-bass/30",       badgeVariant: "bass"    },
};

interface VoicePartCardProps {
  result:           VoicePartResult;
  resultId?:        string;
  songTitle?:       string;
  artist?:          string;
  musicalKey?:      string;
  mode?:            string;
  defaultExpanded?: boolean;
  onSingComplete?:  () => void;
  className?:       string;
}

export function VoicePartCard({
  result, resultId, songTitle, artist, musicalKey, mode,
  defaultExpanded = false, onSingComplete, className,
}: VoicePartCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const meta = PART_META[result.part];
  const hasSung    = !!result.sung_audio_url;
  const hasBacking = !!result.backing_audio_url;

  return (
    <div className={cn("rounded-2xl border transition-all duration-200", meta.cardClass, className)}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{meta.label}</span>
            <Badge variant={meta.badgeVariant}>{meta.range}</Badge>
            {hasSung && <Badge variant="success" className="text-[10px]">Sung</Badge>}
          </div>
          {!expanded && (
            <p className="text-xs text-muted mt-0.5 truncate">
              {result.solfa_text.split(" ").slice(0, 5).join(" ")}…
            </p>
          )}
        </div>
        <span className="text-muted shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-white/10 pt-4">

          {/* Tonic Solfa */}
          <div>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Tonic Solfa</p>
            {result.solfa_notes.length > 0
              ? <SolfaDisplay notes={result.solfa_notes} voicePart={result.part} showLyrics />
              : <SolfaText    text={result.solfa_text}   voicePart={result.part} />
            }
          </div>

          {/* Spoken Solfa (TTS) */}
          {result.tts_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Music2 className="h-3 w-3" /> Spoken Solfa
              </p>
              <AudioPlayer
                src={result.tts_audio_url}
                voicePart={result.part}
                timestamps={result.timestamps}
                solfaText={result.solfa_text}
                downloadFilename={`partora-${result.part}-solfa.mp3`}
              />
            </div>
          )}

          {/* Sung Demo (DiffSinger) */}
          {hasSung && result.sung_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                🎙️ Sung Demonstration
              </p>
              <AudioPlayer
                src={result.sung_audio_url}
                voicePart={result.part}
                downloadFilename={`partora-${result.part}-sung.mp3`}
              />
            </div>
          )}

          {/* Backing Track */}
          {hasBacking && result.backing_audio_url && (
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                🎹 Backing Track
              </p>
              <AudioPlayer
                src={result.backing_audio_url}
                voicePart={result.part}
                downloadFilename={`partora-${result.part}-backing.mp3`}
              />
            </div>
          )}

          {/* Generate sung demo (if not yet generated) */}
          {!hasSung && resultId && (
            <SingGenerateButton
              resultId={resultId}
              onComplete={onSingComplete ?? (() => window.location.reload())}
            />
          )}

          {/* Voice Changer */}
          <VoiceChangerPanel voicePart={result.part} />

          {/* Footer row: range + Ask Coach */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Low</p>
                <p className="text-sm font-mono text-white">{result.range.low}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">High</p>
                <p className="text-sm font-mono text-white">{result.range.high}</p>
              </div>
            </div>
            <AskCoachButton
              voicePart={result.part}
              songTitle={songTitle}
              artist={artist}
              key={musicalKey}
              mode={mode}
              solfaText={result.solfa_text}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function SATBCardGrid({
  soprano, alto, tenor, bass,
  resultId, songTitle, artist, musicalKey, mode,
  onSingComplete, className,
}: {
  soprano: VoicePartResult; alto: VoicePartResult;
  tenor:   VoicePartResult; bass: VoicePartResult;
  resultId?:       string;
  songTitle?:      string;
  artist?:         string;
  musicalKey?:     string;
  mode?:           string;
  onSingComplete?: () => void;
  className?:      string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {[soprano, alto, tenor, bass].map((result, i) => (
        <VoicePartCard
          key={result.part}
          result={result}
          resultId={resultId}
          songTitle={songTitle}
          artist={artist}
          musicalKey={musicalKey}
          mode={mode}
          defaultExpanded={i === 0}
          onSingComplete={onSingComplete}
        />
      ))}
    </div>
  );
}

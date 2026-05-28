"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeader }            from "@/components/layout/PageHeader";
import { CoachStatusBadge }      from "@/components/coach/CoachStatusBadge";
import { CoachMessageBubble, ThinkingBubble } from "@/components/coach/CoachMessageBubble";
import { CoachInput }            from "@/components/coach/CoachInput";
import { CoachContextSelector }  from "@/components/coach/CoachContextSelector";
import { Button }                from "@/components/ui/Button";
import { Card }                  from "@/components/ui/Card";
import { useVoiceCoach }         from "@/hooks/useVoiceCoach";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import type { VoicePart }        from "@partora/types";

export default function CoachPage() {
  const searchParams  = useSearchParams();
  const voicePart     = (searchParams.get("voice_part") ?? undefined) as VoicePart | undefined;
  const songTitle     = searchParams.get("song_title")  ?? undefined;
  const artist        = searchParams.get("artist")      ?? undefined;
  const key           = searchParams.get("key")         ?? undefined;
  const mode          = searchParams.get("mode")        ?? undefined;

  const {
    status, messages, error,
    connect, disconnect, sendMessage, updateContext,
    isConnected, isBusy,
  } = useVoiceCoach({ voicePart, songTitle, artist, key, mode });

  const [localContext, setLocalContext] = useState({
    voicePart, songTitle, artist, key, mode,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConnecting   = status === "connecting";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  function handleContextUpdate(ctx: Partial<typeof localContext>) {
    const updated = { ...localContext, ...ctx };
    setLocalContext(updated);
    updateContext(ctx);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <PageHeader
        title="Voice Coach"
        subtitle="Ask anything about your voice part"
        backHref="/"
        actions={
          <div className="flex items-center gap-3">
            <CoachStatusBadge status={status} />
            <Button
              variant={isConnected ? "danger" : "soprano"}
              size="sm"
              onClick={isConnected ? disconnect : connect}
              loading={isConnecting}
            >
              {isConnected
                ? <><WifiOff className="h-3.5 w-3.5" /> Disconnect</>
                : <><Wifi    className="h-3.5 w-3.5" /> Connect</>
              }
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden px-5 pb-4 gap-4">
        {/* Context selector */}
        <CoachContextSelector
          context={localContext}
          onUpdate={handleContextUpdate}
        />

        {/* Disconnected state */}
        {status === "disconnected" && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Card variant="flat" padding="lg" className="max-w-sm text-center space-y-4">
              <div className="text-4xl">🎤</div>
              <div>
                <p className="text-white font-semibold">Your AI Voice Coach</p>
                <p className="text-sm text-muted mt-1">
                  Connect to ask questions about tonic solfa, your voice part,
                  or anything about the song you&apos;re learning.
                </p>
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={connect}
                loading={isConnecting}
              >
                <Wifi className="h-4 w-4" />
                Start Coaching Session
              </Button>
            </Card>
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <Card variant="flat" padding="sm">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
              <Button variant="ghost" size="sm" onClick={connect} className="ml-auto">
                Reconnect
              </Button>
            </div>
          </Card>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth pr-1">
            {messages.map((msg) => (
              <CoachMessageBubble key={msg.id} message={msg} />
            ))}
            {isBusy && <ThinkingBubble />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input — only when connected */}
        {isConnected && (
          <CoachInput
            onSend={sendMessage}
            disabled={isBusy}
          />
        )}
      </div>
    </div>
  );
}
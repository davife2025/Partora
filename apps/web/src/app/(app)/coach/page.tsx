"use client";
import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader }    from "@/components/layout/PageHeader";
import { useVoiceCoach } from "@/hooks/useVoiceCoach";
import { Send, Wifi, WifiOff, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicePart } from "@partora/types";

const SUGGESTIONS = ["How do I sing my part?","What does Do Re Mi mean?","Explain the soprano range","What is tonic solfa?","What key are we in?"];

export default function CoachPage() {
  const searchParams = useSearchParams();
  const context = {
    voicePart: (searchParams.get("voice_part") ?? undefined) as VoicePart | undefined,
    songTitle: searchParams.get("song_title") ?? undefined,
    artist:    searchParams.get("artist")     ?? undefined,
    key:       searchParams.get("key")        ?? undefined,
    mode:      searchParams.get("mode")       ?? undefined,
  };
  const { status, messages, error, connect, disconnect, sendMessage, isConnected, isBusy } = useVoiceCoach(context);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isBusy]);

  function handleSend() {
    if (!text.trim() || !isConnected || isBusy) return;
    sendMessage(text.trim()); setText("");
  }

  const STATUS_COLORS: Record<string,string> = {
    connected:"text-green-400", thinking:"text-[#7F77DD]", speaking:"text-[#2DA882]",
    connecting:"text-white/40", disconnected:"text-white/20", error:"text-red-400",
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Voice Coach" subtitle="Ask anything about your voice part" backHref="/home"
        actions={
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium capitalize", STATUS_COLORS[status]||"text-white/30")}>{status}</span>
            <button onClick={isConnected ? disconnect : connect}
              className={cn("p-2 rounded-xl transition-all", isConnected ? "text-red-400 hover:bg-red-500/10" : "text-[#7F77DD] hover:bg-[#7F77DD]/10")}>
              {status === "connecting" ? <Loader className="h-4 w-4 animate-spin"/> : isConnected ? <WifiOff className="h-4 w-4"/> : <Wifi className="h-4 w-4"/>}
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
        {messages.length === 0 && !isConnected && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="text-5xl">🎤</div>
            <p className="text-base font-semibold text-white">AI Voice Coach</p>
            <p className="text-sm text-white/30 text-center max-w-xs">
              Connect to ask about tonic solfa, your voice part, or anything about the song you&apos;re learning.
            </p>
            {context.songTitle && (
              <div className="px-3 py-1.5 rounded-full border border-[#7F77DD]/30 bg-[#7F77DD]/10 text-[#7F77DD] text-xs">
                {context.songTitle} · {context.key} {context.mode}
              </div>
            )}
            <button onClick={connect}
              className="px-6 py-3 rounded-2xl bg-[#7F77DD] text-white text-sm font-semibold hover:bg-[#6B63CC] transition-all active:scale-95">
              Start coaching session
            </button>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#7F77DD]/20 border border-[#7F77DD]/30 flex items-center justify-center text-[#7F77DD] text-xs font-bold shrink-0 mt-1 mr-2">P</div>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-[#7F77DD]/20 border border-[#7F77DD]/30 text-white rounded-br-sm"
                : "bg-[#13131E] border border-white/8 text-white/80 rounded-bl-sm")}>
              {msg.content}
            </div>
          </div>
        ))}

        {isBusy && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#7F77DD]/20 border border-[#7F77DD]/30 flex items-center justify-center text-[#7F77DD] text-xs font-bold shrink-0 mt-1 mr-2">P</div>
            <div className="bg-[#13131E] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <div ref={endRef}/>
      </div>

      {isConnected && (
        <div className="px-5 pb-6 space-y-3 border-t border-white/5 pt-3">
          {!text && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/8 text-white/30 hover:text-white hover:border-white/20 transition-all whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask your coach…" disabled={isBusy}
              className="flex-1 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50 disabled:opacity-50"/>
            <button onClick={handleSend} disabled={!text.trim()||isBusy}
              className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                text.trim() && !isBusy ? "bg-[#7F77DD] text-white" : "bg-white/5 text-white/20")}>
              <Send className="h-4 w-4"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

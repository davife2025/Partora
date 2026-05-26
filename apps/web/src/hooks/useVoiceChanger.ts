"use client";

import { useState, useCallback } from "react";
import type { VoicePart }        from "@partora/types";

type VCStatus = "idle" | "uploading" | "transforming" | "complete" | "failed";

interface VCState {
  status:    VCStatus;
  audioUrl:  string | null;
  voicePart: VoicePart | null;
  error:     string | null;
}

const INITIAL: VCState = {
  status: "idle", audioUrl: null, voicePart: null, error: null,
};

export function useVoiceChanger() {
  const [state, setState] = useState<VCState>(INITIAL);

  const transformVoice = useCallback(async (
    audioBlob: Blob,
    voicePart:  VoicePart
  ) => {
    setState({ ...INITIAL, status: "uploading", voicePart });

    const token = await getToken();
    const form  = new FormData();
    form.append("audio",      audioBlob, `recording.${audioBlob.type.split("/")[1] ?? "webm"}`);
    form.append("voice_part", voicePart);

    setState((s) => ({ ...s, status: "transforming" }));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sing/voice-change`,
      {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    form,
      }
    );

    const data = await res.json() as {
      success: boolean;
      data?: { audio_url: string; voice_part: VoicePart };
      error?: string;
    };

    if (!data.success || !data.data) {
      setState({ ...INITIAL, status: "failed", error: data.error ?? "Transformation failed" });
      return;
    }

    setState({
      status:    "complete",
      audioUrl:  data.data.audio_url,
      voicePart: data.data.voice_part,
      error:     null,
    });
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, transformVoice, reset };
}

async function getToken(): Promise<string | null> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { JobStatusResponse } from "@partora/types";

type Status = "idle" | "submitting" | "processing" | "complete" | "failed";

interface State {
  status:   Status;
  jobId:    string | null;
  progress: number;
  step:     string;
  result:   JobStatusResponse["result"] | null;
  error:    string | null;
}

const INITIAL: State = {
  status: "idle", jobId: null, progress: 0,
  step: "", result: null, error: null,
};

export function useRecordAnalysis() {
  const [state, setState] = useState<State>(INITIAL);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    pollCount.current = 0;
  }, []);

  const pollJob = useCallback((jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      pollCount.current++;
      if (pollCount.current > 120) {
        stopPolling();
        setState((s) => ({ ...s, status: "failed", error: "Timed out." }));
        return;
      }
      const res = await api.get<JobStatusResponse>(`/api/analysis/job/${jobId}`);
      if (!res.success || !res.data) return;
      const { status, progress, step, result, error } = res.data;
      setState((s) => ({
        ...s,
        status:   (status === "pending" ? "processing" : status) as Status,
        progress: progress ?? s.progress,
        step:     step    ?? s.step,
        result:   result  ?? s.result,
        error:    error   ?? null,
      }));
      if (status === "complete" || status === "failed") stopPolling();
    }, 2000);
  }, [stopPolling]);

  const submitRecording = useCallback(async (
    audioBlob: Blob,
    meta?: { title?: string; artist?: string }
  ) => {
    setState({ ...INITIAL, status: "submitting", step: "Sending recording…" });

    // Convert blob → base64 for the recognise endpoint
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64      = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    const token = await getToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record`,
      {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          audio_base64: base64,
          mime_type:    audioBlob.type || "audio/webm",
          title:        meta?.title,
          artist:       meta?.artist,
        }),
      }
    );

    const data = await res.json() as { success: boolean; data?: { job_id: string }; error?: string };

    if (!data.success || !data.data) {
      setState({ ...INITIAL, status: "failed", error: data.error ?? "Failed to submit recording" });
      return;
    }

    setState((s) => ({ ...s, jobId: data.data!.job_id, status: "processing", step: "Queued…" }));
    pollJob(data.data.job_id);
  }, [pollJob]);

  const reset = useCallback(() => { stopPolling(); setState(INITIAL); }, [stopPolling]);

  return { ...state, submitRecording, reset };
}

async function getToken(): Promise<string | null> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

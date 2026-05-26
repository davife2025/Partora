"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";

type SingStatus = "idle" | "generating" | "complete" | "failed";

interface SingState {
  status:   SingStatus;
  jobId:    string | null;
  progress: number;
  step:     string;
  error:    string | null;
}

const INITIAL: SingState = {
  status: "idle", jobId: null, progress: 0, step: "", error: null,
};

export function useSingGeneration() {
  const [state, setState] = useState<SingState>(INITIAL);
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
      if (pollCount.current > 60) {
        stopPolling();
        setState((s) => ({ ...s, status: "failed", error: "Generation timed out." }));
        return;
      }

      const res = await api.get<{ status: string; progress: number; step: string; error?: string }>(
        `/api/sing/status/${jobId}`
      );
      if (!res.success || !res.data) return;

      const { status, progress, step, error } = res.data;
      setState((s) => ({
        ...s,
        status:   status === "complete" ? "complete"
                : status === "failed"   ? "failed"
                : "generating",
        progress: progress ?? s.progress,
        step:     step     ?? s.step,
        error:    error    ?? null,
      }));

      if (status === "complete" || status === "failed") stopPolling();
    }, 3000);
  }, [stopPolling]);

  const generateSung = useCallback(async (
    resultId: string,
    opts: { tempo?: number; includeBacking?: boolean } = {}
  ) => {
    setState({ ...INITIAL, status: "generating", step: "Starting…" });

    const res = await api.post<{ job_id: string }>(
      `/api/sing/generate/${resultId}`,
      { tempo: opts.tempo ?? 90, include_backing: opts.includeBacking ?? true }
    );

    if (!res.success || !res.data) {
      setState({ ...INITIAL, status: "failed", error: res.error ?? "Failed to start generation" });
      return;
    }

    setState((s) => ({ ...s, jobId: res.data!.job_id }));
    pollJob(res.data.job_id);
  }, [pollJob]);

  const reset = useCallback(() => { stopPolling(); setState(INITIAL); }, [stopPolling]);

  return { ...state, generateSung, reset };
}

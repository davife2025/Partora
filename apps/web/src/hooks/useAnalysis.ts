"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { LyricsAnalysisRequest, JobStatusResponse } from "@partora/types";

type AnalysisStatus = "idle" | "pending" | "processing" | "complete" | "failed";

interface AnalysisState {
  status:   AnalysisStatus;
  jobId:    string | null;
  progress: number;
  step:     string;
  result:   JobStatusResponse["result"] | null;
  error:    string | null;
}

const INITIAL: AnalysisState = {
  status:   "idle",
  jobId:    null,
  progress: 0,
  step:     "",
  result:   null,
  error:    null,
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS        = 120; // 4 minutes max

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  // ── Stop polling ──────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCount.current = 0;
  }, []);

  // ── Poll job status ───────────────────────────────────────────
  const pollJob = useCallback((jobId: string) => {
    stopPolling();

    pollRef.current = setInterval(async () => {
      pollCount.current++;

      if (pollCount.current > MAX_POLLS) {
        stopPolling();
        setState((s) => ({ ...s, status: "failed", error: "Analysis timed out. Please try again." }));
        return;
      }

      const res = await api.get<JobStatusResponse>(`/api/analysis/job/${jobId}`);
      if (!res.success || !res.data) return;

      const { status, progress, step, result, error } = res.data;

      setState((s) => ({
        ...s,
        status:   status as AnalysisStatus,
        progress: progress ?? s.progress,
        step:     step    ?? s.step,
        result:   result  ?? s.result,
        error:    error   ?? null,
      }));

      if (status === "complete" || status === "failed") {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  // ── Submit lyrics analysis ────────────────────────────────────
  const analyseLyrics = useCallback(async (input: LyricsAnalysisRequest & { title?: string; artist?: string }) => {
    setState({ ...INITIAL, status: "pending", step: "Submitting…" });

    const res = await api.post<{ job_id: string; status: string }>("/api/analysis/lyrics", input);

    if (!res.success || !res.data) {
      setState({ ...INITIAL, status: "failed", error: res.error ?? "Failed to start analysis" });
      return;
    }

    const { job_id } = res.data;
    setState((s) => ({ ...s, jobId: job_id, status: "processing" }));
    pollJob(job_id);
  }, [pollJob]);

  // ── Reset ─────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopPolling();
    setState(INITIAL);
  }, [stopPolling]);

  return { ...state, analyseLyrics, reset };
}

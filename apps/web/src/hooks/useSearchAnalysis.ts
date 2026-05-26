"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { SearchResult, JobStatusResponse } from "@partora/types";

type Status = "idle" | "pending" | "processing" | "complete" | "failed";

interface State {
  status:   Status;
  jobId:    string | null;
  progress: number;
  step:     string;
  result:   JobStatusResponse["result"] | null;
  error:    string | null;
  song:     SearchResult | null;
}

const INITIAL: State = {
  status: "idle", jobId: null, progress: 0,
  step: "", result: null, error: null, song: null,
};

export function useSearchAnalysis() {
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
        status:   status as Status,
        progress: progress ?? s.progress,
        step:     step    ?? s.step,
        result:   result  ?? s.result,
        error:    error   ?? null,
      }));
      if (status === "complete" || status === "failed") stopPolling();
    }, 2000);
  }, [stopPolling]);

  const analyseSong = useCallback(async (song: SearchResult) => {
    setState({ ...INITIAL, status: "pending", step: "Submitting…", song });
    const res = await api.post<{ job_id: string }>(
      "/api/search/analyse",
      {
        title:       song.title,
        artist:      song.artist,
        artwork_url: song.artwork_url,
        duration:    song.duration,
        preview_url: song.preview_url,
        spotify_url: song.spotify_url,
        song_link:   song.apple_music_url,
      }
    );
    if (!res.success || !res.data) {
      setState({ ...INITIAL, status: "failed", song, error: res.error ?? "Failed to start analysis" });
      return;
    }
    setState((s) => ({ ...s, jobId: res.data!.job_id, status: "processing" }));
    pollJob(res.data.job_id);
  }, [pollJob]);

  const reset = useCallback(() => { stopPolling(); setState(INITIAL); }, [stopPolling]);

  return { ...state, analyseSong, reset };
}

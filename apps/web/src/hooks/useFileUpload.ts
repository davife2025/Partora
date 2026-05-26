"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { JobStatusResponse } from "@partora/types";

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "failed";

interface UploadState {
  status:      UploadStatus;
  jobId:       string | null;
  progress:    number;
  step:        string;
  result:      JobStatusResponse["result"] | null;
  error:       string | null;
  uploadPct:   number; // XHR upload progress 0–100
}

const INITIAL: UploadState = {
  status: "idle", jobId: null, progress: 0,
  step: "", result: null, error: null, uploadPct: 0,
};

const POLL_MS  = 2500;
const MAX_POLL = 120;

export function useFileUpload() {
  const [state, setState] = useState<UploadState>(INITIAL);
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
      if (pollCount.current > MAX_POLL) {
        stopPolling();
        setState((s) => ({ ...s, status: "failed", error: "Analysis timed out." }));
        return;
      }
      const res = await api.get<JobStatusResponse>(`/api/analysis/job/${jobId}`);
      if (!res.success || !res.data) return;
      const { status, progress, step, result, error } = res.data;
      setState((s) => ({
        ...s,
        status:   (status === "pending" ? "processing" : status) as UploadStatus,
        progress: progress ?? s.progress,
        step:     step    ?? s.step,
        result:   result  ?? s.result,
        error:    error   ?? null,
      }));
      if (status === "complete" || status === "failed") stopPolling();
    }, POLL_MS);
  }, [stopPolling]);

  const uploadFile = useCallback(async (
    file: File,
    meta: { title?: string; artist?: string }
  ) => {
    setState({ ...INITIAL, status: "uploading", step: "Uploading file…" });

    const form = new FormData();
    form.append("audio", file);
    if (meta.title)  form.append("title",  meta.title);
    if (meta.artist) form.append("artist", meta.artist);

    // Use XHR for upload progress
    const token = await getToken();
    const jobId = await new Promise<string | null>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setState((s) => ({ ...s, uploadPct: Math.round((e.loaded / e.total) * 100) }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 202) {
          const data = JSON.parse(xhr.responseText);
          resolve(data?.data?.job_id ?? null);
        } else reject(new Error(`Upload failed: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    }).catch((err) => {
      setState({ ...INITIAL, status: "failed", error: err.message });
      return null;
    });

    if (!jobId) return;

    setState((s) => ({
      ...s, jobId, status: "processing", step: "Queued for analysis…", uploadPct: 100,
    }));
    pollJob(jobId);
  }, [pollJob]);

  const reset = useCallback(() => {
    stopPolling();
    setState(INITIAL);
  }, [stopPolling]);

  return { ...state, uploadFile, reset };
}

async function getToken(): Promise<string | null> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

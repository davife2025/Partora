"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "stopping"
  | "done"
  | "error";

interface RecorderState {
  status:      RecorderStatus;
  duration:    number;       // seconds recorded so far
  audioBlob:   Blob | null;
  audioUrl:    string | null;
  error:       string | null;
  analyser:    AnalyserNode | null;
}

const MAX_DURATION = 30; // seconds

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>({
    status: "idle", duration: 0,
    audioBlob: null, audioUrl: null,
    error: null, analyser: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef      = useRef(0);

  // ── Clean up on unmount ──────────────────────────────────────
  useEffect(() => () => {
    stopTimer();
    releaseStream();
  }, []);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function releaseStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  // ── Request mic permission ───────────────────────────────────
  const requestPermission = useCallback(async () => {
    setState((s) => ({ ...s, status: "requesting", error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate:       16000,
          channelCount:     1,
        },
      });

      streamRef.current = stream;

      // Set up Web Audio analyser for waveform visualisation
      const audioCtx  = new AudioContext();
      const analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source    = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      setState((s) => ({ ...s, status: "ready", analyser }));
    } catch (err) {
      const msg = err instanceof Error && err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone access and try again."
        : "Could not access microphone. Please check your device settings.";
      setState((s) => ({ ...s, status: "error", error: msg }));
    }
  }, []);

  // ── Start recording ──────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current  = [];
    durationRef.current = 0;

    // Pick best supported MIME type
    const mimeType = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType:  mimeType || undefined,
      audioBitsPerSecond: 128000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob    = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
      const url     = URL.createObjectURL(blob);
      setState((s) => ({ ...s, status: "done", audioBlob: blob, audioUrl: url }));
      stopTimer();
    };

    recorder.start(200); // collect data every 200ms
    mediaRecorderRef.current = recorder;

    setState((s) => ({ ...s, status: "recording", duration: 0 }));

    // Duration counter + auto-stop at MAX_DURATION
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setState((s) => ({ ...s, duration: durationRef.current }));

      if (durationRef.current >= MAX_DURATION) {
        stopRecording();
      }
    }, 1000);
  }, []);

  // ── Stop recording ───────────────────────────────────────────
  const stopRecording = useCallback(() => {
    stopTimer();
    setState((s) => ({ ...s, status: "stopping" }));

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Reset ────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopTimer();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    releaseStream();

    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);

    setState({
      status: "idle", duration: 0,
      audioBlob: null, audioUrl: null,
      error: null, analyser: null,
    });
  }, [state.audioUrl]);

  return {
    ...state,
    maxDuration: MAX_DURATION,
    requestPermission,
    startRecording,
    stopRecording,
    reset,
  };
}

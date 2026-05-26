"use client";

import { PageHeader }          from "@/components/layout/PageHeader";
import { MicButton }           from "@/components/record/MicButton";
import { RecordingPreview }    from "@/components/record/RecordingPreview";
import { RecordLoader }        from "@/components/record/RecordLoader";
import { AnalysisResult }      from "@/components/analyse/AnalysisResult";
import { WaveformVisualiser }  from "@/components/audio/WaveformVisualiser";
import { Card }                from "@/components/ui/Card";
import { useAudioRecorder }    from "@/hooks/useAudioRecorder";
import { useRecordAnalysis }   from "@/hooks/useRecordAnalysis";
import { useToast }            from "@/components/ui/Toast";
import { AlertCircle, Info }   from "lucide-react";
import type { SATBResult }     from "@partora/types";

export default function RecordPage() {
  const recorder = useAudioRecorder();
  const analysis = useRecordAnalysis();
  const { error: showError } = useToast();

  const showRecorder  = analysis.status === "idle" || analysis.status === "failed";
  const showProcessing = analysis.status === "submitting" || analysis.status === "processing";
  const showComplete  = analysis.status === "complete";
  const showFailed    = analysis.status === "failed";

  async function handleSubmit(meta: { title?: string; artist?: string }) {
    if (!recorder.audioBlob) return;
    try {
      await analysis.submitRecording(recorder.audioBlob, meta);
    } catch {
      showError("Failed to submit recording. Please try again.");
    }
  }

  function handleReset() {
    recorder.reset();
    analysis.reset();
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Record Live"
        subtitle="Hum or sing a snippet — up to 30 seconds"
        backHref="/"
      />

      <div className="px-5 pb-10 space-y-6">

        {/* ── Recorder UI ──────────────────────────────────────── */}
        {showRecorder && (
          <>
            {/* Idle / requesting / ready / recording */}
            {recorder.status !== "done" && (
              <div className="flex flex-col items-center pt-6 space-y-6">

                {/* Live waveform during recording */}
                {recorder.status === "recording" && (
                  <WaveformVisualiser
                    analyser={recorder.analyser ?? undefined}
                    voicePart="bass"
                    active
                    height={64}
                    className="w-full max-w-sm"
                  />
                )}

                {/* Mic button hero */}
                <MicButton
                  status={recorder.status}
                  duration={recorder.duration}
                  maxDuration={recorder.maxDuration}
                  onRequestPermission={recorder.requestPermission}
                  onStart={recorder.startRecording}
                  onStop={recorder.stopRecording}
                />

                {/* Tips */}
                {(recorder.status === "idle" || recorder.status === "ready") && (
                  <Card variant="flat" padding="sm" className="w-full max-w-sm">
                    <div className="flex items-start gap-2 text-xs text-muted">
                      <Info className="h-3.5 w-3.5 text-bass shrink-0 mt-0.5" />
                      <ul className="space-y-1.5">
                        <li>Sing or hum the melody — any part of the song works</li>
                        <li>Hold your device 15–30 cm from your mouth for best results</li>
                        <li>Quiet environment gives more accurate key detection</li>
                        <li>Record at least 5 seconds for song recognition to work</li>
                      </ul>
                    </div>
                  </Card>
                )}

                {/* Mic error */}
                {recorder.status === "error" && recorder.error && (
                  <Card variant="flat" padding="sm" className="w-full max-w-sm">
                    <div className="flex items-start gap-2 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>{recorder.error}</p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Recording done — show preview */}
            {recorder.status === "done" && recorder.audioUrl && (
              <RecordingPreview
                audioUrl={recorder.audioUrl}
                duration={recorder.duration}
                onSubmit={handleSubmit}
                onRetake={recorder.reset}
                loading={analysis.status === "submitting"}
              />
            )}
          </>
        )}

        {/* ── Processing ───────────────────────────────────────── */}
        {showProcessing && (
          <Card variant="elevated" padding="lg">
            <RecordLoader
              progress={analysis.progress}
              step={analysis.step}
            />
          </Card>
        )}

        {/* ── Complete ─────────────────────────────────────────── */}
        {showComplete && analysis.result && (
          <AnalysisResult
            result={analysis.result as unknown as SATBResult}
            onReset={handleReset}
          />
        )}

        {/* ── Failed ───────────────────────────────────────────── */}
        {showFailed && analysis.error && (
          <Card variant="flat" padding="md">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Analysis failed</p>
                <p className="text-xs text-muted">{analysis.error}</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-soprano hover:text-soprano/80 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

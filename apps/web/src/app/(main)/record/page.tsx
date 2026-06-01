"use client";
import { PageHeader }         from "@/components/layout/PageHeader";
import { MicButton }          from "@/components/record/MicButton";
import { RecordingPreview }   from "@/components/record/RecordingPreview";
import { AnalysisResult }     from "@/components/analyse/AnalysisResult";
import { WaveformVisualiser } from "@/components/audio/WaveformVisualiser";
import { useAudioRecorder }   from "@/hooks/useAudioRecorder";
import { useRecordAnalysis }  from "@/hooks/useRecordAnalysis";
import { AlertCircle }        from "lucide-react";
import type { SATBResult }    from "@partora/types";

export default function RecordPage() {
  const recorder = useAudioRecorder();
  const analysis = useRecordAnalysis();

  async function handleSubmit(meta: { title?: string; artist?: string }) {
    if (!recorder.audioBlob) return;
    await analysis.submitRecording(recorder.audioBlob, meta);
  }

  function handleReset() { recorder.reset(); analysis.reset(); }

  const isProcessing = analysis.status === "submitting" || analysis.status === "processing";

  return (
    <div className="min-h-screen">
      <PageHeader title="Record Live" subtitle="Hum or sing a snippet — up to 30s" backHref="/home"/>
      <div className="px-5 pb-10 space-y-6">

        {analysis.status === "idle" && recorder.status !== "done" && (
          <div className="flex flex-col items-center pt-4 space-y-6">
            {recorder.status === "recording" && (
              <WaveformVisualiser analyser={recorder.analyser ?? undefined} voicePart="bass" active height={56} className="w-full"/>
            )}
            <MicButton
              status={recorder.status} duration={recorder.duration} maxDuration={recorder.maxDuration}
              onRequestPermission={recorder.requestPermission} onStart={recorder.startRecording} onStop={recorder.stopRecording}
            />
            {recorder.status === "idle" && (
              <p className="text-xs text-white/30 text-center max-w-xs">Tap the mic, hum or sing any part of a song. We detect the key and generate all 4 voice parts.</p>
            )}
            {recorder.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4"/> {recorder.error}
              </div>
            )}
          </div>
        )}

        {analysis.status === "idle" && recorder.status === "done" && recorder.audioUrl && (
          <RecordingPreview audioUrl={recorder.audioUrl} duration={recorder.duration}
            onSubmit={handleSubmit} onRetake={recorder.reset} loading={false}/>
        )}

        {isProcessing && (
          <div className="rounded-3xl border border-white/8 bg-[#13131E] p-6 space-y-4">
            <p className="text-sm text-[#185FA5] text-center">{analysis.step || "Analysing recording…"}</p>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-[#185FA5] rounded-full transition-all duration-500" style={{ width: `${analysis.progress}%` }}/>
            </div>
          </div>
        )}

        {analysis.status === "complete" && analysis.result && (
          <AnalysisResult result={analysis.result as unknown as SATBResult} onReset={handleReset}/>
        )}

        {analysis.status === "failed" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm">{analysis.error}</p>
              <button onClick={handleReset} className="text-xs text-[#7F77DD] mt-2">Try again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

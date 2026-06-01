"use client";

import { PageHeader }      from "@/components/layout/PageHeader";
import { LyricsForm }      from "@/components/analyse/LyricsForm";
import { AnalysisLoader }  from "@/components/analyse/AnalysisLoader";
import { AnalysisResult }  from "@/components/analyse/AnalysisResult";
import { useAnalysis }     from "@/hooks/useAnalysis";
import { useToast }        from "@/components/ui/Toast";
import { AlertCircle }     from "lucide-react";
import type { SATBResult }  from "@partora/types";

export default function AnalysePage() {
  const { status, progress, step, result, error, analyseLyrics, reset } = useAnalysis();
  const { error: showError } = useToast();

  const isIdle       = status === "idle";
  const isProcessing = status === "pending" || status === "processing";
  const isComplete   = status === "complete";
  const isFailed     = status === "failed";

  return (
    <div className="min-h-screen">
      <PageHeader title="Type Lyrics" subtitle="Enter lyrics and choose a key" backHref="/home" />

      <div className="px-5 pb-10 space-y-5">
        {isIdle && (
          <LyricsForm
            onSubmit={async (data) => {
              try { await analyseLyrics(data); }
              catch { showError("Something went wrong. Please try again."); }
            }}
          />
        )}

        {isProcessing && (
          <div className="rounded-3xl border border-white/8 bg-[#13131E] p-6">
            <AnalysisLoader progress={progress} step={step} />
          </div>
        )}

        {isComplete && result && (
          <AnalysisResult result={result as unknown as SATBResult} onReset={reset} />
        )}

        {isFailed && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Analysis failed</p>
                <p className="text-xs text-white/40">{error ?? "Something went wrong."}</p>
                <button onClick={reset} className="text-xs text-[#7F77DD] hover:text-[#9B95E8] underline transition-colors">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { LyricsForm } from "@/components/analyse/LyricsForm";
import { AnalysisLoader } from "@/components/analyse/AnalysisLoader";
import { AnalysisResult } from "@/components/analyse/AnalysisResult";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";
import type { SATBResult } from "@partora/types";

export default function AnalysePage() {
  const { status, progress, step, result, error, analyseLyrics, reset } = useAnalysis();
  const { error: showError } = useToast();

  const isIdle       = status === "idle";
  const isProcessing = status === "pending" || status === "processing";
  const isComplete   = status === "complete";
  const isFailed     = status === "failed";

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Type Lyrics"
        subtitle="Enter lyrics and choose a key"
        backHref="/"
      />

      <div className="px-5 pb-10 space-y-5">

        {/* Idle — show form */}
        {isIdle && (
          <LyricsForm
            onSubmit={async (data) => {
              try {
                await analyseLyrics(data);
              } catch {
                showError("Something went wrong. Please try again.");
              }
            }}
          />
        )}

        {/* Processing — show loader */}
        {isProcessing && (
          <Card variant="elevated" padding="lg">
            <AnalysisLoader progress={progress} step={step} />
          </Card>
        )}

        {/* Complete — show SATB result */}
        {isComplete && result && (
          <AnalysisResult
            result={result as unknown as SATBResult}
            onReset={reset}
          />
        )}

        {/* Failed — show error */}
        {isFailed && (
          <Card variant="flat" padding="md">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Analysis failed</p>
                <p className="text-xs text-muted">{error ?? "Something went wrong. Please try again."}</p>
                <button
                  onClick={reset}
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

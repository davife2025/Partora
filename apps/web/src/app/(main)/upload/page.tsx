"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { AudioDropzone } from "@/components/upload/AudioDropzone";
import { UploadLoader }  from "@/components/upload/UploadLoader";
import { AnalysisResult } from "@/components/analyse/AnalysisResult";
import { useFileUpload }  from "@/hooks/useFileUpload";
import { useToast }       from "@/components/ui/Toast";
import { Card }           from "@/components/ui/Card";
import { AlertCircle }    from "lucide-react";
import type { SATBResult } from "@partora/types";

export default function UploadPage() {
  const {
    status, progress, step, result, error,
    uploadPct, uploadFile, reset,
  } = useFileUpload();

  const { error: showError } = useToast();

  const isIdle       = status === "idle";
  const isUploading  = status === "uploading";
  const isProcessing = status === "processing";
  const isComplete   = status === "complete";
  const isFailed     = status === "failed";

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Upload Audio"
        subtitle="MP3, WAV, AAC, FLAC, OGG — up to 50 MB"
        backHref="/"
      />

      <div className="px-5 pb-10 space-y-5">

        {/* Idle — drop zone */}
        {isIdle && (
          <AudioDropzone
            onUpload={async (file, meta) => {
              try { await uploadFile(file, meta); }
              catch { showError("Upload failed. Please try again."); }
            }}
          />
        )}

        {/* Uploading / processing */}
        {(isUploading || isProcessing) && (
          <Card variant="elevated" padding="lg">
            <UploadLoader
              uploadPct={uploadPct}
              progress={progress}
              step={step}
              status={isUploading ? "uploading" : "processing"}
            />
          </Card>
        )}

        {/* Complete */}
        {isComplete && result && (
          <AnalysisResult
            result={result as unknown as SATBResult}
            onReset={reset}
          />
        )}

        {/* Failed */}
        {isFailed && (
          <Card variant="flat" padding="md">
            <div className="flex items-start gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-medium">Analysis failed</p>
                <p className="text-xs text-muted">
                  {error ?? "Something went wrong. Please check your audio file and try again."}
                </p>
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

        {/* Tips (only when idle) */}
        {isIdle && (
          <Card variant="flat" padding="sm" className="space-y-2">
            <p className="text-xs font-medium text-white/70">Tips for best results</p>
            <ul className="space-y-1.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="text-alto mt-0.5">✓</span>
                Use a clean studio recording for most accurate key detection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alto mt-0.5">✓</span>
                Live or acoustic recordings work too — vocals are isolated automatically
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alto mt-0.5">✓</span>
                Longer clips (30 sec+) give Demucs more context for better separation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alto mt-0.5">✓</span>
                Analysis takes 1–3 minutes depending on file size
              </li>
            </ul>
          </Card>
        )}

      </div>
    </div>
  );
}

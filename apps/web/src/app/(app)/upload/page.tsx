"use client";
import { PageHeader }     from "@/components/layout/PageHeader";
import { AudioDropzone }  from "@/components/upload/AudioDropzone";
import { UploadLoader }   from "@/components/upload/UploadLoader";
import { AnalysisResult } from "@/components/analyse/AnalysisResult";
import { useFileUpload }  from "@/hooks/useFileUpload";
import { AlertCircle }    from "lucide-react";
import type { SATBResult } from "@partora/types";

export default function UploadPage() {
  const { status, progress, step, result, error, uploadPct, uploadFile, reset } = useFileUpload();
  const isProcessing = status === "uploading" || status === "processing";

  return (
    <div className="min-h-screen">
      <PageHeader title="Upload Audio" subtitle="MP3, WAV, AAC — up to 50MB" backHref="/home"/>
      <div className="px-5 pb-10 space-y-5">
        {status === "idle" && (
          <>
            <AudioDropzone onUpload={uploadFile}/>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 space-y-2 text-xs text-white/30">
              <p className="font-medium text-white/50">Tips for best results</p>
              <p>✓ Studio recordings give most accurate key detection</p>
              <p>✓ Vocals are isolated automatically — live recordings work too</p>
              <p>✓ Analysis takes 1–3 minutes depending on file size</p>
            </div>
          </>
        )}
        {isProcessing && (
          <div className="rounded-3xl border border-white/8 bg-[#13131E] p-6">
            <UploadLoader uploadPct={uploadPct} progress={progress} step={step} status={isProcessing ? (status === "uploading" ? "uploading" : "processing") : "processing"}/>
          </div>
        )}
        {status === "complete" && result && (
          <AnalysisResult result={result as unknown as SATBResult} onReset={reset}/>
        )}
        {status === "failed" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm">{error ?? "Upload failed"}</p>
              <button onClick={reset} className="text-xs text-[#7F77DD] mt-2">Try again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

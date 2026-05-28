"use client";

import { useEffect } from "react";
import { Button }    from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D14] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl mb-4">🎵</div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-[#6B6B8A]">
            Partora hit an unexpected error. This has been logged and we&apos;ll look into it.
          </p>
          {error.digest && (
            <p className="text-xs text-[#4A4A6A] font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="secondary" onClick={reset}>Try again</Button>
            <Button variant="primary"   onClick={() => window.location.href = "/"}>
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

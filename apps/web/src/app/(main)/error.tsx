"use client";

import { Button } from "@/components/ui/Button";
import Link       from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error:  Error & { digest?: string };
  reset:  () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <p className="text-sm text-muted">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="primary">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

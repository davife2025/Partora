import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl mb-4">🎵</div>
        <h1 className="text-2xl font-semibold text-white">Page not found</h1>
        <p className="text-sm text-muted">
          This page doesn&apos;t exist or you may not have access to it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl
                     bg-soprano text-white font-medium text-sm hover:bg-soprano-dark
                     transition-colors mt-4"
        >
          Back to Partora
        </Link>
      </div>
    </div>
  );
}

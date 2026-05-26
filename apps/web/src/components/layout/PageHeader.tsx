import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, backHref, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center gap-3 px-5 py-4", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="p-2 rounded-xl text-muted hover:text-white hover:bg-background-tertiary transition-colors -ml-2 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-white leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

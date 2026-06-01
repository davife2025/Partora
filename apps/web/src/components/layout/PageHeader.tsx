import Link      from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn }    from "@/lib/utils";

interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  backHref?: string;
  actions?:  React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, backHref, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center gap-3 px-5 pt-5 pb-3", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-white truncate leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

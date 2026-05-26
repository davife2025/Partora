"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Mic, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/",        label: "Home",    icon: Home },
  { href: "/search",  label: "Search",  icon: Search },
  { href: "/record",  label: "Record",  icon: Mic },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/coach",   label: "Coach",   icon: MessageCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        const isRecord = href === "/record";

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 px-3 min-h-[56px] justify-center",
              "transition-all duration-150 relative",
              isRecord
                ? "text-white"
                : isActive
                  ? "text-soprano"
                  : "text-muted hover:text-white"
            )}
          >
            {isRecord ? (
              <span className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                "bg-soprano shadow-lg shadow-soprano/30",
                "transition-transform duration-150 active:scale-95",
                isActive && "ring-2 ring-soprano/40 ring-offset-2 ring-offset-background"
              )}>
                <Icon className="h-5 w-5 text-white" />
              </span>
            ) : (
              <>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-soprano" />
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

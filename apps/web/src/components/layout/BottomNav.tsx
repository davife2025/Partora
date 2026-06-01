"use client";

import Link        from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Mic, BookOpen, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home",    label: "Home",    icon: Home          },
  { href: "/search",  label: "Search",  icon: Search        },
  { href: "/record",  label: "Record",  icon: Mic,  hero: true },
  { href: "/library", label: "Library", icon: BookOpen      },
  { href: "/coach",   label: "Coach",   icon: MessageCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around
                 border-t border-white/5 bg-[#0D0D14]/90 backdrop-blur-xl
                 pt-2 pb-[env(safe-area-inset-bottom,8px)]"
      aria-label="Main navigation"
    >
      {TABS.map(({ href, label, icon: Icon, hero }) => {
        const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href));

        if (hero) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center"
            >
              <span className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90",
                isActive
                  ? "bg-[#7F77DD] shadow-lg shadow-[#7F77DD]/40"
                  : "bg-[#7F77DD]/80 shadow-md shadow-[#7F77DD]/20"
              )}>
                <Icon className="h-5 w-5 text-white" />
              </span>
              <span className="text-[9px] mt-0.5 font-medium text-white/50">{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 relative transition-all",
              isActive ? "text-[#7F77DD]" : "text-white/30 hover:text-white/60"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-medium">{label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#7F77DD]"/>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-5 blur-3xl bg-soprano" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl bg-bass" />
      </div>

      {/* Page content */}
      <main className="flex-1 pb-20 relative z-10">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}

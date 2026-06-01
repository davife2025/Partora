import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav }    from "@/components/layout/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D14]">
      {/* Subtle ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/3  w-64 h-64 rounded-full blur-3xl opacity-5"
             style={{ background: "radial-gradient(circle,#7F77DD,transparent)" }}/>
        <div className="absolute bottom-1/3 right-0 w-56 h-56 rounded-full blur-3xl opacity-5"
             style={{ background: "radial-gradient(circle,#185FA5,transparent)" }}/>
      </div>

      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

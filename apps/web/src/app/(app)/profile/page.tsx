import { createClient }         from "@/lib/supabase/server";
import { redirect }              from "next/navigation";
import { PageHeader }            from "@/components/layout/PageHeader";
import { logoutAction, updateProfileAction } from "@/app/actions/auth.actions";
import Link                      from "next/link";
import type { Metadata }         from "next";

export const metadata: Metadata = { title: "Profile" };

const PARTS = [
  { v:"soprano", c:"#7F77DD", r:"C4–A5" },
  { v:"alto",    c:"#2DA882", r:"G3–E5" },
  { v:"tenor",   c:"#D4820A", r:"C3–A4" },
  { v:"bass",    c:"#185FA5", r:"E2–E4" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { count } = await supabase.from("songs").select("id", { count:"exact", head:true }).eq("user_id", user.id);

  const vp = profile?.preferred_voice_part as string | undefined;

  return (
    <div className="min-h-screen">
      <PageHeader title="Profile" backHref="/home"/>
      <div className="px-5 pb-10 space-y-4">

        {/* Avatar card */}
        <div className="rounded-3xl border border-white/8 bg-[#13131E] p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
               style={{ background:"#7F77DD25", border:"1px solid #7F77DD30", color:"#7F77DD" }}>
            {(profile?.full_name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white truncate">{profile?.full_name ?? "User"}</p>
            <p className="text-sm text-white/30 truncate">{user.email}</p>
            <p className="text-xs text-white/20 mt-1">{count ?? 0} songs analysed</p>
          </div>
        </div>

        {/* Edit form */}
        <form action={updateProfileAction} className="rounded-3xl border border-white/8 bg-[#13131E] p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Edit profile</p>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Full name</label>
            <input name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Your name"
              className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"/>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40">Voice part</label>
            <div className="grid grid-cols-4 gap-2">
              {PARTS.map(p => (
                <label key={p.v} className="cursor-pointer">
                  <input type="radio" name="preferred_voice_part" value={p.v} defaultChecked={vp===p.v} className="sr-only"/>
                  <div className="rounded-xl border py-2.5 text-center text-xs font-semibold transition-all"
                       style={vp===p.v ? { borderColor:p.c+"50", background:p.c+"15", color:p.c } : { borderColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.3)" }}>
                    {p.v.charAt(0).toUpperCase()+p.v.slice(1)}
                    <div className="text-[9px] mt-0.5" style={{opacity:0.5}}>{p.r}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-2xl bg-[#7F77DD] text-white text-sm font-semibold hover:bg-[#6B63CC] transition-all">
            Save changes
          </button>
        </form>

        {/* Links */}
        <div className="rounded-3xl border border-white/8 bg-[#13131E] p-5 space-y-1">
          {[
            { href:"/library", label:"My library" },
            { href:"/history", label:"Full history" },
            { href:"/coach",   label:"Voice coach" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center justify-between py-3 text-sm text-white/40 hover:text-white transition-colors border-b border-white/5 last:border-0">
              {l.label} <span className="text-white/20">→</span>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <form action={logoutAction}>
          <button type="submit" className="w-full py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

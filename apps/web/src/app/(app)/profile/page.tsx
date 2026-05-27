import { createClient }   from "@/lib/supabase/server";
import { redirect }        from "next/navigation";
import { PageHeader }      from "@/components/layout/PageHeader";
import { Card }            from "@/components/ui/Card";
import { Badge }           from "@/components/ui/index";
import { logoutAction }    from "@/app/actions/auth.actions";
import { Button }          from "@/components/ui/Button";
import { SubmitButton }    from "@/components/ui/Button";
import { updateProfileAction } from "@/app/actions/auth.actions";
import Link                from "next/link";
import type { Metadata }   from "next";

export const metadata: Metadata = { title: "Profile" };

const VOICE_PARTS = ["soprano", "alto", "tenor", "bass"] as const;

const PART_COLORS: Record<string, string> = {
  soprano: "bg-voice-soprano border-soprano/40 text-soprano",
  alto:    "bg-voice-alto border-alto/40 text-alto",
  tenor:   "bg-voice-tenor border-tenor/40 text-tenor",
  bass:    "bg-voice-bass border-bass/40 text-bass",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: songCount } = await supabase
    .from("songs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const total = (songCount as unknown as { count: number })?.count ?? 0;

  return (
    <div className="min-h-screen">
      <PageHeader title="Profile" backHref="/" />

      <div className="px-5 pb-10 space-y-5">

        {/* Avatar + name */}
        <Card variant="flat" padding="md" className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-soprano/20 border border-soprano/30
                          flex items-center justify-center text-soprano text-xl font-bold shrink-0">
            {(profile?.full_name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white truncate">
              {profile?.full_name ?? "Unnamed"}
            </p>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <p className="text-xs text-muted mt-1">{total} songs analysed</p>
          </div>
        </Card>

        {/* Edit profile form */}
        <Card variant="flat" padding="md" className="space-y-4">
          <p className="text-sm font-medium text-white">Edit profile</p>
          <form action={updateProfileAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted">Full name</label>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                className="w-full rounded-xl border border-border bg-background-tertiary
                           px-4 py-3 text-sm text-white placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-soprano/40"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted">Voice part</label>
              <div className="grid grid-cols-4 gap-2">
                {VOICE_PARTS.map((part) => (
                  <label key={part} className="cursor-pointer">
                    <input
                      type="radio"
                      name="preferred_voice_part"
                      value={part}
                      defaultChecked={profile?.preferred_voice_part === part}
                      className="sr-only"
                    />
                    <div className={`rounded-xl border py-3 text-center text-xs font-medium transition-all
                                    ${profile?.preferred_voice_part === part
                                      ? `${PART_COLORS[part]} border`
                                      : "border-border bg-background-tertiary text-muted"}`}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <SubmitButton variant="primary" fullWidth>Save changes</SubmitButton>
          </form>
        </Card>

        {/* Quick links */}
        <Card variant="flat" padding="md" className="space-y-2">
          <p className="text-sm font-medium text-white mb-3">Quick links</p>
          <Link href="/library" className="flex items-center justify-between py-2 text-sm text-muted hover:text-white transition-colors">
            <span>My library</span>
            <span className="text-xs">{total} songs →</span>
          </Link>
          <Link href="/history" className="flex items-center justify-between py-2 text-sm text-muted hover:text-white transition-colors">
            <span>Full history</span>
            <span className="text-xs">→</span>
          </Link>
          <Link href="/coach" className="flex items-center justify-between py-2 text-sm text-muted hover:text-white transition-colors">
            <span>Voice coach</span>
            <span className="text-xs">→</span>
          </Link>
        </Card>

        {/* Sign out */}
        <form action={logoutAction}>
          <Button type="submit" variant="danger" fullWidth>
            Sign out
          </Button>
        </form>

      </div>
    </div>
  );
}

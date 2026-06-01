import { redirect }     from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next } = await searchParams;
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(next ?? "/home");

  redirect("/login?error=Could not confirm email. Please try again.");
}
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirming..." };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { code?: string; next?: string };
}) {
  const supabase = await createClient();

  if (searchParams.code) {
    await supabase.auth.exchangeCodeForSession(searchParams.code);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.next ?? "/");
  }

  redirect("/login?error=Could not confirm email. Please try again.");
}

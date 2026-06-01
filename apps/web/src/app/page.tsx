import { createClient } from "@/lib/supabase/server";
import { redirect }     from "next/navigation";
import LandingPage       from "@/components/landing/LandingPage";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated users go straight to the app
  if (user) redirect("/home");

  // Everyone else sees the landing page
  return <LandingPage />;
}

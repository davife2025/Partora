import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

/** Admin client — bypasses RLS, only use server-side */
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { persistSession: false } }
);

/** Public client — respects RLS */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

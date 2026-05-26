import { supabaseAdmin } from "../config/supabase.js";
import { AppError } from "../middleware/error.middleware.js";
import type { UserProfile } from "@partora/types";

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) throw new AppError("Profile not found", 404);
  return data as UserProfile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "full_name" | "preferred_voice_part" | "avatar_url">>
): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) throw new AppError("Failed to update profile", 500);
  return data as UserProfile;
}

export async function getSongHistory(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from("songs")
    .select(`
      *,
      satb_results(id, key, mode, soprano_solfa, alto_solfa, tenor_solfa, bass_solfa, created_at)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError("Failed to fetch history", 500);
  return data ?? [];
}

export async function getLibrary(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("library")
    .select(`
      saved_at,
      songs(*, satb_results(id, created_at))
    `)
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) throw new AppError("Failed to fetch library", 500);
  return data ?? [];
}

export async function saveToLibrary(userId: string, songId: string) {
  const { error } = await supabaseAdmin
    .from("library")
    .upsert({ user_id: userId, song_id: songId });

  if (error) throw new AppError("Failed to save to library", 500);
  return { saved: true };
}

export async function removeFromLibrary(userId: string, songId: string) {
  const { error } = await supabaseAdmin
    .from("library")
    .delete()
    .eq("user_id", userId)
    .eq("song_id", songId);

  if (error) throw new AppError("Failed to remove from library", 500);
  return { removed: true };
}

export async function deleteSong(userId: string, songId: string) {
  const { error } = await supabaseAdmin
    .from("songs")
    .delete()
    .eq("id", songId)
    .eq("user_id", userId);

  if (error) throw new AppError("Failed to delete song", 500);
  return { deleted: true };
}

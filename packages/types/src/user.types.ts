export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_voice_part?: "soprano" | "alto" | "tenor" | "bass";
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

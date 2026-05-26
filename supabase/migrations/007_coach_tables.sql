-- One-time WebSocket connection tokens for the voice coach
create table if not exists public.coach_tokens (
  token       uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  expires_at  timestamptz not null,
  created_at  timestamptz default now() not null
);

-- Only the owning user can see their own token
alter table public.coach_tokens enable row level security;

create policy "Users can manage own coach tokens"
  on public.coach_tokens for all
  using (auth.uid() = user_id);

-- Auto-clean expired tokens (runs nightly via pg_cron if available)
create index if not exists coach_tokens_expires_at_idx
  on public.coach_tokens(expires_at);

-- Coach conversation history (optional persistence)
create table if not exists public.coach_conversations (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  song_id     uuid references public.songs(id) on delete set null,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  audio_url   text,
  created_at  timestamptz default now() not null
);

alter table public.coach_conversations enable row level security;

create policy "Users can manage own conversations"
  on public.coach_conversations for all
  using (auth.uid() = user_id);

create index coach_conversations_user_idx
  on public.coach_conversations(user_id, created_at desc);

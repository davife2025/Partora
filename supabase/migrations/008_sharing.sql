-- Shared links table (public read, owner write)
create table if not exists public.shared_links (
  id          uuid default uuid_generate_v4() primary key,
  song_id     uuid references public.songs(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  slug        text unique not null default substr(md5(random()::text), 1, 8),
  expires_at  timestamptz,
  created_at  timestamptz default now() not null
);

alter table public.shared_links enable row level security;

create policy "Anyone can view shared links"
  on public.shared_links for select using (true);

create policy "Owners can manage their links"
  on public.shared_links for all using (auth.uid() = user_id);

create index shared_links_slug_idx  on public.shared_links(slug);
create index shared_links_song_idx  on public.shared_links(song_id);

-- Add share_count to songs for tracking popularity
alter table public.songs
  add column if not exists share_count integer default 0;

-- ─── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── User Profiles ────────────────────────────────────────────────
create table public.profiles (
  id                  uuid references auth.users(id) on delete cascade primary key,
  email               text not null,
  full_name           text,
  avatar_url          text,
  preferred_voice_part text check (preferred_voice_part in ('soprano','alto','tenor','bass')),
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Songs ────────────────────────────────────────────────────────
create table public.songs (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  artist       text,
  album        text,
  key          text not null,
  mode         text not null check (mode in ('major','minor')),
  bpm          integer,
  duration     integer,
  artwork_url  text,
  lyrics       text,
  source       text not null check (source in ('lyrics','upload','search','record')),
  source_url   text,
  created_at   timestamptz default now() not null
);

alter table public.songs enable row level security;

create policy "Users can manage own songs"
  on public.songs for all
  using (auth.uid() = user_id);

create index songs_user_id_idx on public.songs(user_id);
create index songs_created_at_idx on public.songs(created_at desc);

-- ─── Analysis Jobs ────────────────────────────────────────────────
create table public.analysis_jobs (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  song_id      uuid references public.songs(id) on delete set null,
  status       text not null default 'pending'
                 check (status in ('pending','processing','complete','failed')),
  input_mode   text not null check (input_mode in ('lyrics','upload','search','record')),
  progress     integer default 0,
  step         text,
  error        text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table public.analysis_jobs enable row level security;

create policy "Users can manage own jobs"
  on public.analysis_jobs for all
  using (auth.uid() = user_id);

create index jobs_user_id_idx on public.analysis_jobs(user_id);
create index jobs_status_idx on public.analysis_jobs(status);

-- ─── SATB Results ─────────────────────────────────────────────────
create table public.satb_results (
  id              uuid default uuid_generate_v4() primary key,
  song_id         uuid references public.songs(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  key             text not null,
  mode            text not null,
  soprano_solfa   text,
  alto_solfa      text,
  tenor_solfa     text,
  bass_solfa      text,
  soprano_data    jsonb,
  alto_data       jsonb,
  tenor_data      jsonb,
  bass_data       jsonb,
  created_at      timestamptz default now() not null
);

alter table public.satb_results enable row level security;

create policy "Users can view own results"
  on public.satb_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own results"
  on public.satb_results for insert
  with check (auth.uid() = user_id);

create index satb_song_id_idx on public.satb_results(song_id);
create index satb_user_id_idx on public.satb_results(user_id);

-- ─── Saved / Library ──────────────────────────────────────────────
create table public.library (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  song_id    uuid references public.songs(id) on delete cascade not null,
  saved_at   timestamptz default now() not null,
  unique (user_id, song_id)
);

alter table public.library enable row level security;

create policy "Users can manage own library"
  on public.library for all
  using (auth.uid() = user_id);

-- ─── Updated_at trigger ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_jobs_updated_at
  before update on public.analysis_jobs
  for each row execute procedure public.set_updated_at();

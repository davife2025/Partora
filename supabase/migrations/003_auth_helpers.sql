-- ─── Helper: get current user's profile in one call ─────────────
create or replace function public.get_my_profile()
returns setof public.profiles
language sql security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

-- ─── Helper: get current user's song history with results ────────
create or replace function public.get_my_history(lim int default 20, off int default 0)
returns table (
  song_id       uuid,
  title         text,
  artist        text,
  key           text,
  mode          text,
  source        text,
  artwork_url   text,
  created_at    timestamptz,
  result_id     uuid,
  soprano_solfa text,
  alto_solfa    text,
  tenor_solfa   text,
  bass_solfa    text
)
language sql security definer
set search_path = public
as $$
  select
    s.id           as song_id,
    s.title,
    s.artist,
    s.key,
    s.mode,
    s.source,
    s.artwork_url,
    s.created_at,
    r.id           as result_id,
    r.soprano_solfa,
    r.alto_solfa,
    r.tenor_solfa,
    r.bass_solfa
  from public.songs s
  left join public.satb_results r on r.song_id = s.id
  where s.user_id = auth.uid()
  order by s.created_at desc
  limit lim offset off;
$$;

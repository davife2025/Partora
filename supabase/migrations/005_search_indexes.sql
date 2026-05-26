-- Index to speed up recent searches query
create index if not exists songs_source_user_idx
  on public.songs(user_id, source, created_at desc);

-- Full text search index on song title + artist for future use
alter table public.songs
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(artist, ''))
    ) stored;

create index if not exists songs_search_vector_idx
  on public.songs using gin(search_vector);

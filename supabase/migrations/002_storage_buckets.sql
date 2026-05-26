-- ─── Storage Buckets ─────────────────────────────────────────────

-- Audio uploads from users (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio-uploads',
  'audio-uploads',
  false,
  52428800, -- 50MB
  array['audio/mpeg','audio/mp3','audio/wav','audio/webm','audio/ogg','audio/aac','audio/flac']
) on conflict do nothing;

-- Generated audio outputs (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio-outputs',
  'audio-outputs',
  false,
  10485760, -- 10MB
  array['audio/mpeg','audio/wav','audio/webm']
) on conflict do nothing;

-- ─── Storage RLS Policies ─────────────────────────────────────────

create policy "Users can upload own audio"
  on storage.objects for insert
  with check (bucket_id = 'audio-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own audio"
  on storage.objects for select
  using (
    (bucket_id = 'audio-uploads' or bucket_id = 'audio-outputs')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own audio"
  on storage.objects for delete
  using (
    (bucket_id = 'audio-uploads' or bucket_id = 'audio-outputs')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add audio analysis metadata to SATB results (used by upload + record modes)
alter table public.satb_results
  add column if not exists detected_key        text,
  add column if not exists detected_mode       text,
  add column if not exists key_confidence      float,
  add column if not exists midi_note_count     integer,
  add column if not exists audio_duration_secs float,
  add column if not exists input_mode          text check (input_mode in ('lyrics','upload','search','record'));

-- Update songs table to store audio file reference
alter table public.songs
  add column if not exists audio_storage_path  text,
  add column if not exists audio_duration_secs float,
  add column if not exists detected_key        text,
  add column if not exists detected_mode       text,
  add column if not exists key_confidence      float;

comment on column public.songs.audio_storage_path  is 'Supabase Storage path for uploaded audio (audio-uploads bucket)';
comment on column public.songs.detected_key        is 'Key detected by Basic Pitch + KS algorithm';
comment on column public.songs.key_confidence      is 'Krumhansl-Schmuckler confidence score 0–1';

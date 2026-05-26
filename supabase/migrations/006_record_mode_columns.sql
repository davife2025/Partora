-- Track whether a recording was recognised by AudD
alter table public.analysis_jobs
  add column if not exists recognised_title  text,
  add column if not exists recognised_artist text,
  add column if not exists recognition_confidence text
    check (recognition_confidence in ('high','medium','low'));

-- Index for record-mode jobs
create index if not exists jobs_input_mode_idx
  on public.analysis_jobs(user_id, input_mode, created_at desc);

comment on column public.analysis_jobs.recognised_title  is 'AudD-identified song title for record mode';
comment on column public.analysis_jobs.recognised_artist is 'AudD-identified artist for record mode';

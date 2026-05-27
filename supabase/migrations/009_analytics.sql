-- Function to clean up expired coach tokens (call periodically)
create or replace function public.cleanup_expired_tokens()
returns void language plpgsql security definer as $$
begin
  delete from public.coach_tokens where expires_at < now();
end;
$$;

-- Add view count to satb_results for analytics
alter table public.satb_results
  add column if not exists view_count integer default 0;

-- Increment view count when result is accessed
create or replace function public.increment_result_views(result_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.satb_results
  set view_count = view_count + 1
  where id = result_id;
end;
$$;

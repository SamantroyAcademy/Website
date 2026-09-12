-- Shared rate limiting for the public API routes (contact, lead, mock score).
-- Vercel runs many short-lived instances, so an in-memory counter alone can
-- be dodged by spreading requests; this counter is shared by all of them.
-- Keys are SHA-256 hashes of "bucket:ip" (no raw IPs are stored). The table
-- lives in the private schema, so it is never exposed through the REST API.

create table if not exists private.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         int not null default 0
);

-- Returns true while the caller is within `p_limit` hits per `p_window_seconds`.
create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits int;
begin
  insert into private.rate_limits as t (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when t.window_start < now() - make_interval(secs => p_window_seconds) then 1 else t.hits + 1 end,
    window_start = case when t.window_start < now() - make_interval(secs => p_window_seconds) then now() else t.window_start end
  returning hits into v_hits;

  -- Occasional housekeeping: drop counters idle for more than a day.
  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

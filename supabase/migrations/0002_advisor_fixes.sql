-- =====================================================================
-- 0002: Advisor fixes — pinned search_path on functions + revoke direct
-- RPC execution on the SECURITY DEFINER signup trigger helper.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end; $$;
-- Only the auth trigger should ever call this — never the REST RPC surface.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create or replace function public.expire_missed_check_ins()
returns integer language plpgsql security definer set search_path = public as $$
declare
  expired_count integer := 0;
begin
  update public.check_ins
    set status = 'missed'
    where status = 'active'
      and now() > (expected_arrival + (grace_period_minutes || ' minutes')::interval)
    returning count(*) into expired_count;
  return expired_count;
end; $$;
revoke execute on function public.expire_missed_check_ins() from public, anon, authenticated;

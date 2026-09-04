-- =====================================================================
-- MehfoozAi — Full schema migration (Prompts #1, #2, #3)
-- Run in Supabase SQL Editor as the full initial migration.
-- Covers: profiles, emergency_contacts, incidents, complaints,
-- check_ins, safety_reports, api_activity_logs, conversations,
-- messages + RLS + auto-profile trigger + check-in monitor schedule.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  safe_nickname text,
  district text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en','ur')),
  theme_mode text not null default 'light',
  stealth_pin_hash text,              -- hashed, NEVER plaintext
  pin_salt text,                      -- per-user random salt for PIN hashing
  vault_salt text,                    -- per-user random salt for PBKDF2 vault key
  emergency_contact_name text,
  emergency_contact_phone text,
  discreet_notifications boolean not null default true,
  quick_exit_hotkey text not null default 'Escape',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. EMERGENCY CONTACTS
-- ---------------------------------------------------------------------
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  relation text,
  phone text not null,
  email text,
  is_default_notified boolean not null default false,
  is_emergency_contact boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. INCIDENTS — ZERO-KNOWLEDGE vault (ciphertext only)
-- ---------------------------------------------------------------------
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  incident_type text,                -- physical_stalking, workplace_harassment, cyber_extortion, domestic_dispute, ...
  title text,                        -- short label (may be encrypted along with note)
  cipher_text text not null,         -- AES-GCM-256 ciphertext produced on-device
  iv text not null,                  -- base64 initialization vector
  salt text,                         -- per-user PBKDF2 salt snapshot
  occurred_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. COMPLAINTS
-- ---------------------------------------------------------------------
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tracking_number text unique,       -- e.g. PSCA-LHR-2026-XXXX
  status text not null default 'draft' check (status in ('draft','submitted','under_review','resolved')),
  stage text,
  category text,
  district text,
  summary_plain text,                -- NON-sensitive routing metadata only (category/district/urgency)
  cipher_text text,                  -- encrypted complaint body (zero-knowledge)
  iv text,
  delivery_status text,              -- 'dispatched' | 'dispatch_failed' | 'local_only'
  delivery_message_id text,
  is_mock_handoff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. CHECK-INS (server-side monitored safety timers)
-- ---------------------------------------------------------------------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination text,
  expected_arrival timestamptz not null,
  grace_period_minutes int not null default 2,
  status text not null default 'active' check (status in ('active','arrived','missed','cancelled')),
  contact_ids jsonb not null default '[]'::jsonb,   -- emergency contact ids to alert if missed
  contact_phones jsonb not null default '[]'::jsonb, -- denormalized phones so the monitor can dispatch
  user_display_name text,
  last_known_lat double precision,
  last_known_lng double precision,
  alerts_dispatched_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. SAFETY REPORTS (community, anonymous-able)
-- ---------------------------------------------------------------------
create table if not exists public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null, -- anonymous-able
  report_type text not null,        -- broken_lighting, harassment_hotspot, ...
  lat double precision not null,
  lng double precision not null,
  details text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. API ACTIVITY LOGS (Prompt #2 live dashboard)
-- ---------------------------------------------------------------------
create table if not exists public.api_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  endpoint text not null,           -- e.g. '/api/complaint-handoff', 'twilio:sms', 'resend:email'
  method text not null default 'POST',
  target_service text not null,     -- 'twilio', 'resend', 'gemini', 'supabase', 'geolocation'
  status text not null,             -- 'pending', 'success', 'failed', 'timeout'
  status_code int,                  -- HTTP status code or null
  request_preview text,             -- truncated JSON of request body (max 500 chars, no secrets)
  response_preview text,            -- truncated JSON of response body (max 500 chars)
  duration_ms int,
  error_message text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. CONVERSATIONS + MESSAGES (Prompt #3 agent memory)
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,                          -- auto-generated from first message
  language text not null default 'en',
  message_count int not null default 0,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'model', 'tool_result')),
  content text not null,               -- the message text or tool result JSON
  function_calls jsonb,                -- Gemini function call proposals (if role=model)
  tool_results jsonb,                  -- tool execution results fed back to model (if role=tool_result)
  execution_status text,               -- 'pending_confirmation', 'confirmed', 'executed', 'failed', 'cancelled'
  metadata jsonb,                      -- citations, confidence, intent, etc.
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists check_ins_status_idx on public.check_ins (status, expected_arrival);
create index if not exists api_activity_logs_created_idx on public.api_activity_logs (created_at desc);

-- ---------------------------------------------------------------------
-- 9. AUTO-CREATE PROFILE ON SIGNUP
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists complaints_touch on public.complaints;
create trigger complaints_touch before update on public.complaints
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.incidents           enable row level security;
alter table public.complaints          enable row level security;
alter table public.check_ins           enable row level security;
alter table public.safety_reports      enable row level security;
alter table public.api_activity_logs   enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;

-- Owner-only access on all private tables (auth.uid() wrapped in a select
-- for per-row initplan performance; TO authenticated per Supabase guidance)
drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own_contacts" on public.emergency_contacts;
create policy "own_contacts" on public.emergency_contacts
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own_incidents" on public.incidents;
create policy "own_incidents" on public.incidents
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own_complaints" on public.complaints;
create policy "own_complaints" on public.complaints
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own_checkins" on public.check_ins;
create policy "own_checkins" on public.check_ins
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own_conversations" on public.conversations;
create policy "own_conversations" on public.conversations
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own_messages" on public.messages;
create policy "own_messages" on public.messages
  for all to authenticated using (
    conversation_id in (select id from public.conversations where user_id = (select auth.uid()))
  ) with check (
    conversation_id in (select id from public.conversations where user_id = (select auth.uid()))
  );

-- Community reports readable by all authenticated users, writable by owner
drop policy if exists "read_safety_reports" on public.safety_reports;
create policy "read_safety_reports" on public.safety_reports
  for select to authenticated using (true);

drop policy if exists "own_safety_reports" on public.safety_reports;
create policy "own_safety_reports" on public.safety_reports
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Activity logs: user sees only their own
drop policy if exists "own_activity_logs" on public.api_activity_logs;
create policy "own_activity_logs" on public.api_activity_logs
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- 11. REALTIME for api_activity_logs (live dashboard updates)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'api_activity_logs'
  ) then
    alter publication supabase_realtime add table public.api_activity_logs;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 12. CHECK-IN MONITOR (server-side timer via pg_cron)
-- Part 1: expire overdue check-ins every 60s (pure SQL).
-- Part 2 (added after the Edge Function is deployed, see 0002): ping
--         /functions/v1/check-in-monitor so missed check-ins dispatch SMS.
-- ---------------------------------------------------------------------
create or replace function public.expire_missed_check_ins()
returns integer language plpgsql security definer as $$
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

-- Enable the Supabase Cron module (pg_cron must live in pg_catalog).
do $ext$
begin
  begin
    create extension if not exists pg_cron with schema pg_catalog;
    grant usage on schema cron to postgres;
    grant all privileges on all tables in schema cron to postgres;
  exception when others then
    raise notice 'pg_cron unavailable, check-in monitor scheduling skipped: %', sqlerrm;
  end;
end $ext$;

-- Idempotent scheduling (unschedule an existing job first — ON CONFLICT is
-- invalid on function calls, and unschedule raises when the job is absent).
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'mehfooz-check-in-monitor') then
      perform cron.unschedule('mehfooz-check-in-monitor');
    end if;
    perform cron.schedule(
      'mehfooz-check-in-monitor',
      '* * * * *',
      $job$
        select public.expire_missed_check_ins();
      $job$
    );
  end if;
end $cron$;

-- Keep the internal function callable only by the scheduler, not by API roles.
revoke execute on function public.expire_missed_check_ins() from public, anon, authenticated;

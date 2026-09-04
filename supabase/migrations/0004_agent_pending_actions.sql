-- 0004: Agent pending actions table
-- Stores tool proposals that require explicit user confirmation before execution.
-- Supports idempotency (no duplicate SMS/email), 10-minute expiry, and RLS.

create table if not exists public.agent_pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  tool_name text not null,
  arguments jsonb not null default '{}'::jsonb,
  display_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending_confirmation'
    check (status in (
      'pending_confirmation',
      'confirmed',
      'executing',
      'executed',
      'failed',
      'cancelled',
      'expired'
    )),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes',
  confirmed_at timestamptz,
  executed_at timestamptz,
  result jsonb,
  error_message text,
  idempotency_key text unique
);

-- Enable Row Level Security
alter table public.agent_pending_actions enable row level security;

-- RLS policy: users can only see and modify their own pending actions
create policy "own_agent_pending_actions" on public.agent_pending_actions
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Index for fast lookups by user + status (confirmation queries)
create index if not exists idx_agent_pending_actions_user_status
  on public.agent_pending_actions (user_id, status)
  where status = 'pending_confirmation';

-- Index for expiry cleanup (future pg_cron job)
create index if not exists idx_agent_pending_actions_expires
  on public.agent_pending_actions (expires_at)
  where status = 'pending_confirmation';

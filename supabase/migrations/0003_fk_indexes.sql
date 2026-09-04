-- =====================================================================
-- 0003: Covering indexes for user_id foreign keys (applied remotely as
-- fk_user_id_indexes). RLS policies filter on user_id for every request,
-- so these keep row-security scans fast.
-- =====================================================================

create index if not exists api_activity_logs_user_idx on public.api_activity_logs (user_id);
create index if not exists check_ins_user_idx on public.check_ins (user_id);
create index if not exists complaints_user_idx on public.complaints (user_id);
create index if not exists conversations_user_idx on public.conversations (user_id);
create index if not exists emergency_contacts_user_idx on public.emergency_contacts (user_id);
create index if not exists incidents_user_idx on public.incidents (user_id);
create index if not exists safety_reports_user_idx on public.safety_reports (user_id);

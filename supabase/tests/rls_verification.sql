-- =====================================================================
-- MehfoozAi — RLS Verification Tests
-- Run in Supabase SQL Editor (as superuser / service_role) to verify
-- that cross-user access is denied on every RLS-protected table.
--
-- HOW TO RUN:
--   1. Paste this entire script into the Supabase SQL Editor.
--   2. Execute — every DO block raises NOTICE "PASS" or EXCEPTION on fail.
--   3. All 10 tests should print "PASS". Any failure throws an exception.
--
-- PREREQUISITES:
--   - Two distinct auth.users rows (user A and user B).
--     If they don't exist, this script creates them via auth.users insert.
--   - Migrations 0001–0004 applied.
-- =====================================================================

-- ---- Setup: create two test users if they don't exist ----
do $setup$
declare
  user_a uuid;
  user_b uuid;
begin
  -- Create or fetch user A
  select id into user_a from auth.users
    where email = 'rls-test-a@mehfooz.test' limit 1;
  if user_a is null then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    values (gen_random_uuid(), 'rls-test-a@mehfooz.test', 'test', now(), '{}', '{}')
    returning id into user_a;
  end if;

  -- Create or fetch user B
  select id into user_b from auth.users
    where email = 'rls-test-b@mehfooz.test' limit 1;
  if user_b is null then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    values (gen_random_uuid(), 'rls-test-b@mehfooz.test', 'test', now(), '{}', '{}')
    returning id into user_b;
  end if;

  raise notice 'User A: %, User B: %', user_a, user_b;
end $setup$;

-- ---- Test 1: profiles — user B cannot read user A's profile ----
do $t1$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  -- Ensure user A has a profile row
  insert into public.profiles (id, email, full_name)
  values (user_a, 'rls-test-a@mehfooz.test', 'Test User A')
  on conflict (id) do nothing;

  -- Simulate user B's session
  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.profiles where id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A profile (count=%)', cnt;
  end if;
  raise notice 'PASS: profiles RLS — user B cannot read user A';
  reset role;
end $t1$;

-- ---- Test 2: emergency_contacts — user B cannot read user A's contacts ----
do $t2$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.emergency_contacts (user_id, name, phone)
  values (user_a, 'Test Contact', '+923001234567')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.emergency_contacts where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A contacts (count=%)', cnt;
  end if;
  raise notice 'PASS: emergency_contacts RLS — user B cannot read user A';
  reset role;
end $t2$;

-- ---- Test 3: incidents — user B cannot read user A's vault records ----
do $t3$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.incidents (user_id, cipher_text, iv)
  values (user_a, 'encrypted_test_data', 'test_iv')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.incidents where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A incidents (count=%)', cnt;
  end if;
  raise notice 'PASS: incidents RLS — user B cannot read user A';
  reset role;
end $t3$;

-- ---- Test 4: complaints — user B cannot read user A's complaints ----
do $t4$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.complaints (user_id, status)
  values (user_a, 'draft')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.complaints where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A complaints (count=%)', cnt;
  end if;
  raise notice 'PASS: complaints RLS — user B cannot read user A';
  reset role;
end $t4$;

-- ---- Test 5: check_ins — user B cannot read user A's check-ins ----
do $t5$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.check_ins (user_id, expected_arrival)
  values (user_a, now() + interval '30 minutes')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.check_ins where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A check_ins (count=%)', cnt;
  end if;
  raise notice 'PASS: check_ins RLS — user B cannot read user A';
  reset role;
end $t5$;

-- ---- Test 6: conversations — user B cannot read user A's conversations ----
do $t6$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.conversations (user_id, title)
  values (user_a, 'Test Conversation')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.conversations where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A conversations (count=%)', cnt;
  end if;
  raise notice 'PASS: conversations RLS — user B cannot read user A';
  reset role;
end $t6$;

-- ---- Test 7: messages — user B cannot read messages in user A's conversations ----
do $t7$
declare
  user_a uuid;
  conv_id uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  select id into conv_id from public.conversations where user_id = user_a limit 1;
  if conv_id is null then
    insert into public.conversations (user_id, title) values (user_a, 'Msg Test')
    returning id into conv_id;
  end if;
  insert into public.messages (conversation_id, role, content)
  values (conv_id, 'user', 'test message')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.messages where conversation_id = conv_id;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A messages (count=%)', cnt;
  end if;
  raise notice 'PASS: messages RLS — user B cannot read user A messages';
  reset role;
end $t7$;

-- ---- Test 8: api_activity_logs — user B cannot read user A's activity ----
do $t8$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.api_activity_logs (user_id, endpoint, method, target_service, status)
  values (user_a, '/test', 'GET', 'server', 'success')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.api_activity_logs where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A activity logs (count=%)', cnt;
  end if;
  raise notice 'PASS: api_activity_logs RLS — user B cannot read user A';
  reset role;
end $t8$;

-- ---- Test 9: safety_reports — user B CAN read (community read policy) ----
do $t9$
declare
  user_a uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  insert into public.safety_reports (user_id, report_type, lat, lng)
  values (user_a, 'broken_lighting', 31.5204, 74.3587)
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.safety_reports where user_id = user_a;
  if cnt = 0 then
    raise exception 'FAIL: user B cannot read community safety reports';
  end if;
  raise notice 'PASS: safety_reports RLS — user B can read community reports';
  reset role;
end $t9$;

-- ---- Test 10: agent_pending_actions — user B cannot read user A's actions ----
do $t10$
declare
  user_a uuid;
  conv_id uuid;
  cnt int;
begin
  select id into user_a from auth.users where email = 'rls-test-a@mehfooz.test' limit 1;
  select id into conv_id from public.conversations where user_id = user_a limit 1;
  if conv_id is null then
    insert into public.conversations (user_id, title) values (user_a, 'Action Test')
    returning id into conv_id;
  end if;
  insert into public.agent_pending_actions (user_id, conversation_id, tool_name, arguments)
  values (user_a, conv_id, 'send_sms_to_contact', '{}')
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub',
    (select id::text from auth.users where email = 'rls-test-b@mehfooz.test' limit 1), true);
  set local role authenticated;

  select count(*) into cnt from public.agent_pending_actions where user_id = user_a;
  if cnt > 0 then
    raise exception 'FAIL: user B can read user A pending actions (count=%)', cnt;
  end if;
  raise notice 'PASS: agent_pending_actions RLS — user B cannot read user A';
  reset role;
end $t10$;

-- ---- Cleanup (optional — uncomment to remove test data) ----
-- delete from public.agent_pending_actions where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.messages where conversation_id in (select id from public.conversations where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test'));
-- delete from public.conversations where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.api_activity_logs where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.safety_reports where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.check_ins where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.complaints where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.incidents where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.emergency_contacts where user_id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from public.profiles where id in (select id from auth.users where email like 'rls-test-%@mehfooz.test');
-- delete from auth.users where email like 'rls-test-%@mehfooz.test';

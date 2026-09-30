-- =====================================================================
-- Security core: server-side auth + safe public verification
--
-- This migration is ADDITIVE ONLY. It creates functions; it does not
-- enable RLS, revoke anything, drop anything, or delete a single row.
-- The running site keeps working exactly as before while this is applied.
--
-- Lockdown happens in a later migration, AFTER the frontend is deployed
-- to use these functions.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Session helpers
--
-- The app keeps its existing login system. The browser sends its session
-- token in an `x-session-token` header on every request; these functions
-- turn that into a trusted user id inside the database, which RLS
-- policies can then rely on.
-- ---------------------------------------------------------------------

create or replace function public.app_session_token()
returns text
language plpgsql
stable
as $$
declare
  v_headers text;
begin
  v_headers := current_setting('request.headers', true);
  if v_headers is null or v_headers = '' then
    return null;
  end if;
  return nullif(v_headers::json ->> 'x-session-token', '');
exception when others then
  return null;
end $$;


create or replace function public.app_session_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.user_id
  from public.admin_sessions s
  join public.admin_users u on u.id = s.user_id
  where s.session_token = public.app_session_token()
    and s.is_active = true
    and s.expires_at > now()
    and u.is_active = true
  limit 1
$$;


-- True when the caller holds a valid, unexpired staff session.
create or replace function public.app_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.app_session_user_id() is not null
$$;


-- True when that staff member is an admin.
create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users u
    where u.id = public.app_session_user_id()
      and lower(coalesce(u.role, 'user')) = 'admin'
  )
$$;


-- ---------------------------------------------------------------------
-- 2. Login
--
-- Replaces the old flow, which downloaded every password hash to the
-- browser so JavaScript could compare them. The comparison now happens
-- in here; the password column never leaves the database.
-- ---------------------------------------------------------------------

create or replace function public.app_login(
  p_username      text,
  p_password_hash text,
  p_user_agent    text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  public.admin_users%rowtype;
  v_token text;
  v_perms jsonb;
begin
  if p_username is null or p_password_hash is null then
    return jsonb_build_object('ok', false);
  end if;

  select * into v_user
  from public.admin_users
  where lower(username) = lower(trim(p_username))
    and is_active = true
  limit 1;

  -- Single failure path for "no such user" and "wrong password", so the
  -- response cannot be used to discover which usernames exist.
  if v_user.id is null or v_user.password is distinct from p_password_hash then
    insert into public.admin_activity_log (user_id, action, resource, details, user_agent)
    values (
      v_user.id,
      'LOGIN_FAILED',
      'authentication',
      jsonb_build_object(
        'username', lower(trim(p_username)),
        'reason', case when v_user.id is null then 'user_not_found' else 'invalid_password' end
      ),
      p_user_agent
    );
    return jsonb_build_object('ok', false);
  end if;

  -- 256 bits of randomness, from two v4 UUIDs (no pgcrypto dependency).
  v_token := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');

  insert into public.admin_sessions (user_id, session_token, expires_at, is_active, user_agent)
  values (v_user.id, v_token, now() + interval '24 hours', true, p_user_agent);

  update public.admin_users set last_login = now() where id = v_user.id;

  insert into public.admin_activity_log (user_id, action, resource, details, user_agent)
  values (
    v_user.id,
    'LOGIN',
    'authentication',
    jsonb_build_object('username', v_user.username, 'role', v_user.role),
    p_user_agent
  );

  select to_jsonb(p) - 'id' - 'user_id' - 'created_at' - 'updated_at'
    into v_perms
  from public.admin_permissions p
  where p.user_id = v_user.id
  limit 1;

  return jsonb_build_object(
    'ok', true,
    'session_token', v_token,
    'user', jsonb_build_object(
      'id',       v_user.id,
      'username', v_user.username,
      'email',    v_user.email,
      'role',     coalesce(v_user.role, 'user')
    ),
    'permissions', coalesce(v_perms, '{}'::jsonb)
  );
end $$;


-- Validates the caller's session and returns who they are.
-- Returns {ok:false} rather than an error when the session is gone.
create or replace function public.app_current_user()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_user  public.admin_users%rowtype;
  v_perms jsonb;
begin
  v_id := public.app_session_user_id();
  if v_id is null then
    return jsonb_build_object('ok', false);
  end if;

  select * into v_user from public.admin_users where id = v_id;

  update public.admin_sessions
     set last_activity = now()
   where session_token = public.app_session_token();

  select to_jsonb(p) - 'id' - 'user_id' - 'created_at' - 'updated_at'
    into v_perms
  from public.admin_permissions p
  where p.user_id = v_id
  limit 1;

  return jsonb_build_object(
    'ok', true,
    'user', jsonb_build_object(
      'id',       v_user.id,
      'username', v_user.username,
      'email',    v_user.email,
      'role',     coalesce(v_user.role, 'user')
    ),
    'permissions', coalesce(v_perms, '{}'::jsonb)
  );
end $$;


create or replace function public.app_logout()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.admin_sessions
     set is_active = false
   where session_token = public.app_session_token();
end $$;


-- Changing your own password, verified against the old one server-side.
create or replace function public.app_change_password(
  p_old_hash text,
  p_new_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_user public.admin_users%rowtype;
begin
  v_id := public.app_session_user_id();
  if v_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_user from public.admin_users where id = v_id;

  if v_user.password is distinct from p_old_hash then
    insert into public.admin_activity_log (user_id, action, resource, details)
    values (v_id, 'PASSWORD_CHANGE_FAILED', 'authentication',
            jsonb_build_object('reason', 'invalid_old_password'));
    return jsonb_build_object('ok', false, 'error', 'invalid_old_password');
  end if;

  update public.admin_users
     set password = p_new_hash, updated_at = now()
   where id = v_id;

  insert into public.admin_password_changes
    (user_id, old_password_hash, new_password_hash, changed_by)
  values (v_id, v_user.password, p_new_hash, v_id);

  -- Every other session for this user is ended; the current one survives.
  update public.admin_sessions
     set is_active = false
   where user_id = v_id
     and session_token is distinct from public.app_session_token();

  insert into public.admin_activity_log (user_id, action, resource)
  values (v_id, 'PASSWORD_CHANGED', 'authentication');

  return jsonb_build_object('ok', true);
end $$;


-- ---------------------------------------------------------------------
-- 3. Public document verification
--
-- The verification pages used to run `select *`, which handed anyone
-- who guessed an id the salary, home address, phone number and email on
-- the record. These return only what a verifier legitimately needs:
-- is this document real, who is it for, and is it still valid.
--
-- Nothing here deletes or alters certificate content; they only bump the
-- verification counter, exactly as the old pages did.
-- ---------------------------------------------------------------------

create or replace function public.verify_offer(p_offer_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row    public.offer_letters%rowtype;
  v_status text;
begin
  select * into v_row
  from public.offer_letters
  where offer_id = p_offer_id
    and coalesce(is_deleted, false) = false
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('ok', false, 'status', 'invalid');
  end if;

  v_status := case when v_row.expiry_date is not null and current_date > v_row.expiry_date
                   then 'expired' else 'valid' end;

  update public.offer_letters
     set verified_at        = now(),
         verification_count = coalesce(verification_count, 0) + 1,
         status             = case when v_status = 'expired' then 'expired' else status end
   where id = v_row.id;

  insert into public.offer_verifications (offer_id, status)
  values (p_offer_id, v_status);

  return jsonb_build_object(
    'ok', true,
    'status', v_status,
    'document', jsonb_build_object(
      'offer_id',          v_row.offer_id,
      'employee_name',     v_row.employee_name,
      'position',          v_row.position,
      'department',        v_row.department,
      'start_date',        v_row.start_date,
      'issue_date',        v_row.issue_date,
      'expiry_date',       v_row.expiry_date,
      'signature_hash',    v_row.signature_hash,
      'signature_signed_at',    v_row.signature_signed_at,
      'signature_signer_name',  v_row.signature_signer_name,
      'signature_signer_title', v_row.signature_signer_title,
      'verification_count', coalesce(v_row.verification_count, 0) + 1
    )
  );
end $$;


create or replace function public.verify_internship(p_certificate_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.internship_certificates%rowtype;
begin
  select * into v_row
  from public.internship_certificates
  where certificate_id = p_certificate_id
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('ok', false, 'status', 'invalid');
  end if;

  update public.internship_certificates
     set verified_at        = now(),
         verification_count = coalesce(verification_count, 0) + 1
   where id = v_row.id;

  insert into public.internship_verifications (certificate_id, status)
  values (p_certificate_id, 'valid');

  return jsonb_build_object(
    'ok', true,
    'status', coalesce(v_row.status, 'valid'),
    'document', jsonb_build_object(
      'certificate_id',  v_row.certificate_id,
      'candidate_name',  v_row.candidate_name,
      'father_name',     v_row.father_name,
      'university_name', v_row.university_name,
      'joining_date',    v_row.joining_date,
      'leaving_date',    v_row.leaving_date,
      'issue_date',      v_row.issue_date,
      'signature_hash',         v_row.signature_hash,
      'signature_signed_at',    v_row.signature_signed_at,
      'signature_signer_name',  v_row.signature_signer_name,
      'signature_signer_title', v_row.signature_signer_title,
      'verification_count', coalesce(v_row.verification_count, 0) + 1
    )
  );
end $$;


create or replace function public.verify_experience(p_certificate_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.experience_certificates%rowtype;
begin
  select * into v_row
  from public.experience_certificates
  where certificate_id = p_certificate_id
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('ok', false, 'status', 'invalid');
  end if;

  update public.experience_certificates
     set verified_at        = now(),
         verification_count = coalesce(verification_count, 0) + 1
   where id = v_row.id;

  insert into public.experience_verifications (certificate_id, status)
  values (p_certificate_id, 'valid');

  return jsonb_build_object(
    'ok', true,
    'status', coalesce(v_row.status, 'valid'),
    'document', jsonb_build_object(
      'certificate_id', v_row.certificate_id,
      'candidate_name', v_row.candidate_name,
      'father_name',    v_row.father_name,
      'projects',       v_row.projects,
      'issue_date',     v_row.issue_date,
      'signature_hash',         v_row.signature_hash,
      'signature_signed_at',    v_row.signature_signed_at,
      'signature_signer_name',  v_row.signature_signer_name,
      'signature_signer_title', v_row.signature_signer_title,
      'verification_count', coalesce(v_row.verification_count, 0) + 1
    )
  );
end $$;


-- Employment verification. Deliberately omits salary, address, phone,
-- email and emergency contact, which the old page returned in full.
create or replace function public.verify_employee(p_employee_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.staff%rowtype;
begin
  select * into v_row
  from public.staff
  where employee_id = p_employee_id
  limit 1;

  if v_row.id is null then
    return jsonb_build_object('ok', false, 'status', 'invalid');
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', 'verified',
    'document', jsonb_build_object(
      'employee_id',  v_row.employee_id,
      'name',         v_row.name,
      'position',     v_row.position,
      'department',   v_row.department,
      'join_date',    v_row.join_date,
      'leaving_date', v_row.leaving_date,
      'status',       v_row.status,
      'photo',        v_row.photo
    )
  );
end $$;


-- ---------------------------------------------------------------------
-- 4. Grants
-- ---------------------------------------------------------------------

-- Callable without a session (these are the front doors).
grant execute on function public.app_login(text, text, text)      to anon, authenticated;
grant execute on function public.verify_offer(text)               to anon, authenticated;
grant execute on function public.verify_internship(text)          to anon, authenticated;
grant execute on function public.verify_experience(text)          to anon, authenticated;
grant execute on function public.verify_employee(text)            to anon, authenticated;

-- Callable by anyone, but internally require a valid session.
grant execute on function public.app_current_user()               to anon, authenticated;
grant execute on function public.app_logout()                     to anon, authenticated;
grant execute on function public.app_change_password(text, text)  to anon, authenticated;
grant execute on function public.app_is_staff()                   to anon, authenticated;
grant execute on function public.app_is_admin()                   to anon, authenticated;
grant execute on function public.app_session_user_id()            to anon, authenticated;
grant execute on function public.app_session_token()              to anon, authenticated;

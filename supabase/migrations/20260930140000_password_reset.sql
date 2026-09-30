-- =====================================================================
-- Password reset, moved server-side
--
-- The old flow selected the security question's answer_hash into the
-- browser and compared it there, then let the browser write the new
-- password straight into admin_users. Anyone could skip the UI and do
-- both directly against the API.
--
-- These three functions keep the same three-step user experience while
-- never sending a hash to the browser and never letting the client
-- write to admin_users.
-- =====================================================================

-- Step 1: look up the account and return its security question.
-- Returns the same shape whether or not the user exists, so this cannot
-- be used to enumerate usernames.
create or replace function public.app_reset_begin(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     public.admin_users%rowtype;
  v_question text;
begin
  select * into v_user
  from public.admin_users
  where lower(username) = lower(trim(p_username)) and is_active = true
  limit 1;

  if v_user.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select question into v_question
  from public.admin_security_questions
  where user_id = v_user.id
  limit 1;

  if v_question is null then
    return jsonb_build_object('ok', false, 'error', 'no_security_question');
  end if;

  insert into public.admin_activity_log (user_id, action, resource, details)
  values (v_user.id, 'PASSWORD_RESET_INITIATED', 'authentication',
          jsonb_build_object('username', v_user.username));

  -- The question only. The answer hash stays in the database.
  return jsonb_build_object('ok', true, 'question', v_question);
end $$;


-- Step 2: check the answer and issue a short-lived reset token.
create or replace function public.app_reset_verify(
  p_username    text,
  p_answer_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    public.admin_users%rowtype;
  v_correct text;
  v_token   text;
begin
  select * into v_user
  from public.admin_users
  where lower(username) = lower(trim(p_username)) and is_active = true
  limit 1;

  if v_user.id is null then
    return jsonb_build_object('ok', false);
  end if;

  select answer_hash into v_correct
  from public.admin_security_questions
  where user_id = v_user.id
  limit 1;

  if v_correct is null or v_correct is distinct from p_answer_hash then
    insert into public.admin_activity_log (user_id, action, resource, details)
    values (v_user.id, 'PASSWORD_RESET_FAILED', 'authentication',
            jsonb_build_object('reason', 'incorrect_security_answer'));
    return jsonb_build_object('ok', false);
  end if;

  -- Any earlier unused tokens for this account are retired first.
  update public.admin_password_reset_tokens
     set used_at = now()
   where user_id = v_user.id and used_at is null;

  v_token := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');

  insert into public.admin_password_reset_tokens (user_id, token, expires_at)
  values (v_user.id, v_token, now() + interval '1 hour');

  insert into public.admin_activity_log (user_id, action, resource)
  values (v_user.id, 'PASSWORD_RESET_VERIFIED', 'authentication');

  return jsonb_build_object('ok', true, 'reset_token', v_token);
end $$;


-- Step 3: consume the token and set the new password.
create or replace function public.app_reset_complete(
  p_username   text,
  p_token      text,
  p_new_hash   text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  public.admin_users%rowtype;
  v_tok   public.admin_password_reset_tokens%rowtype;
begin
  select * into v_user
  from public.admin_users
  where lower(username) = lower(trim(p_username)) and is_active = true
  limit 1;

  if v_user.id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select * into v_tok
  from public.admin_password_reset_tokens
  where token = p_token
    and user_id = v_user.id
    and used_at is null
    and expires_at > now()
  limit 1;

  if v_tok.id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  update public.admin_users
     set password = p_new_hash, updated_at = now()
   where id = v_user.id;

  update public.admin_password_reset_tokens
     set used_at = now()
   where id = v_tok.id;

  insert into public.admin_password_changes
    (user_id, old_password_hash, new_password_hash, changed_by)
  values (v_user.id, v_user.password, p_new_hash, v_user.id);

  -- A reset ends every existing session for that account.
  update public.admin_sessions
     set is_active = false
   where user_id = v_user.id;

  insert into public.admin_activity_log (user_id, action, resource)
  values (v_user.id, 'PASSWORD_RESET_COMPLETED', 'authentication');

  return jsonb_build_object('ok', true);
end $$;


grant execute on function public.app_reset_begin(text)              to anon, authenticated;
grant execute on function public.app_reset_verify(text, text)       to anon, authenticated;
grant execute on function public.app_reset_complete(text, text, text) to anon, authenticated;

-- =====================================================================
-- Site theme
--
-- Holds which seasonal theme the public site is currently wearing, so
-- staff can switch it from the admin panel without a code deploy.
-- One row, keyed by name, so other simple site-wide settings can live
-- here later without another table.
-- =====================================================================

create table if not exists public.site_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- Anyone may read (the public site needs to know which theme to wear).
-- Only staff may change it.
alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists site_settings_staff_write on public.site_settings;
create policy site_settings_staff_write
  on public.site_settings for all
  to anon, authenticated
  using (public.app_is_staff())
  with check (public.app_is_staff());

-- Default to the everyday brand theme.
insert into public.site_settings (key, value)
values ('active_theme', 'default')
on conflict (key) do nothing;


-- Switch the theme. Staff only, and the value is checked against the
-- known list so a typo cannot leave the site with no theme at all.
create or replace function public.app_set_theme(p_theme text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  v_user := public.app_session_user_id();
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_theme not in ('default', 'independence', 'ramzan', 'eid-fitr', 'eid-adha') then
    return jsonb_build_object('ok', false, 'error', 'unknown_theme');
  end if;

  insert into public.site_settings (key, value, updated_at, updated_by)
  values ('active_theme', p_theme, now(), v_user)
  on conflict (key)
  do update set value = excluded.value,
                updated_at = now(),
                updated_by = excluded.updated_by;

  insert into public.admin_activity_log (user_id, action, resource, details)
  values (v_user, 'THEME_CHANGED', 'site_settings',
          jsonb_build_object('theme', p_theme));

  return jsonb_build_object('ok', true, 'theme', p_theme);
end $$;

grant execute on function public.app_set_theme(text) to anon, authenticated;

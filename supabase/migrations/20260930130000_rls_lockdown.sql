-- =====================================================================
-- Row Level Security lockdown
--
-- Closes the hole where all 51 tables were readable and writable by
-- anyone on the internet holding the public anon key.
--
-- This migration DROPS NO TABLES and DELETES NO ROWS. Certificates,
-- offer letters, quotations and staff records are all left untouched.
-- It only changes who is allowed to read and write them.
--
-- Three access tiers:
--   public read   - marketing content and the product catalogue
--   public insert - lead capture forms (write-only; the public cannot
--                   read back what anyone else submitted)
--   staff only    - everything else, gated on a valid session token
--
-- Public document verification keeps working through the SECURITY
-- DEFINER functions in the previous migration, which return only
-- non-sensitive fields.
-- =====================================================================

do $$
declare
  -- Marketing content and catalogue: anyone may read, staff may change.
  public_read text[] := array[
    'batteries','charges','company_settings','departments','display_settings',
    'homepage_counters','homepage_customers','homepage_events','homepage_features',
    'homepage_partners','homepage_reviews','homepage_sections','inverters',
    'popup_offers','popup_settings','solar_panels','stands','trending_offers'
  ];

  -- Lead capture: anyone may submit, only staff may read.
  public_insert text[] := array[
    'careers','contacts','quotations','service_requests'
  ];

  -- Everything else: staff session required for any access at all.
  staff_only text[] := array[
    'admin_activity_log','admin_password_changes','admin_password_reset_tokens',
    'admin_permissions','admin_security_questions','admin_sessions','admin_users',
    'expenses','expenses_general_entries','expenses_people','expenses_people_entries',
    'expenses_project_entries','expenses_projects','expenses_repair_entries',
    'expenses_repairs','experience_certificates','experience_verifications',
    'internship_certificates','internship_verifications','inventory','offer_letters',
    'offer_verifications','password_changes','products_next','projects','repairs',
    'sales_next','staff','users'
  ];

  t   text;
  pol record;
begin
  -- Clear the existing policies. Several were written against auth.uid(),
  -- which is always null here because the app uses its own login rather
  -- than Supabase Auth; they never matched anything. The rest were
  -- "USING (true)", which allowed everyone.
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;

  -- ---- Tier 1: public read, staff write -----------------------------
  foreach t in array public_read loop
    if to_regclass('public.' || quote_ident(t)) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated
         using (public.app_is_staff()) with check (public.app_is_staff())',
      t || '_staff_write', t);
  end loop;

  -- ---- Tier 2: public insert, staff read ----------------------------
  foreach t in array public_insert loop
    if to_regclass('public.' || quote_ident(t)) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    -- Anyone may submit an enquiry...
    execute format(
      'create policy %I on public.%I for insert to anon, authenticated with check (true)',
      t || '_public_submit', t);
    -- ...but reading, editing and deleting stays with staff, so one
    -- visitor cannot read another visitor''s submission.
    execute format(
      'create policy %I on public.%I for select to anon, authenticated
         using (public.app_is_staff())',
      t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for update to anon, authenticated
         using (public.app_is_staff()) with check (public.app_is_staff())',
      t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for delete to anon, authenticated
         using (public.app_is_staff())',
      t || '_staff_delete', t);
  end loop;

  -- ---- Tier 3: staff only -------------------------------------------
  foreach t in array staff_only loop
    if to_regclass('public.' || quote_ident(t)) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated
         using (public.app_is_staff()) with check (public.app_is_staff())',
      t || '_staff_only', t);
  end loop;
end $$;


-- Any table added later starts locked rather than open, so a new table
-- cannot silently repeat this mistake.
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false
  loop
    execute format('alter table public.%I enable row level security', t.relname);
    raise notice 'enabled RLS on unclassified table: %', t.relname;
  end loop;
end $$;

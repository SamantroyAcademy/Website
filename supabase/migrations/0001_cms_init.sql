-- ============================================================================
-- SAMANTROY ACADEMY CMS - initial schema, roles, RLS & storage
-- Run in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- Idempotent: safe to re-run.
--
-- Security model (see docs/PROJECT-BLUEPRINT.md section 15):
--   - The FIRST auth user bootstraps as 'super_admin'.
--   - Every later signup lands as 'pending' (no access at all).
--   - Admins are minted only by a super-admin through /api/admin/create-user.
--   - The last super-admin can never be demoted or deleted.
--   - Role decisions are serialised with an advisory lock (no signup races).
-- ============================================================================

-- Private schema for SECURITY DEFINER helpers (NOT exposed to the Data API).
create schema if not exists private;

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES  (admin accounts + role)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'pending',
  created_at  timestamptz not null default now()
);
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('pending','admin','super_admin'));
alter table public.profiles enable row level security;

-- Authorization helpers. SECURITY DEFINER so they can read profiles regardless
-- of the caller's RLS; empty search_path so they cannot be hijacked.
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin','super_admin')
  );
$$;

create or replace function private.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'super_admin'
  );
$$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using ( id = (select auth.uid()) or private.is_super_admin() );

drop policy if exists "profiles_write" on public.profiles;
create policy "profiles_write" on public.profiles
  for all to authenticated
  using ( private.is_super_admin() )
  with check ( private.is_super_admin() );

-- New auth user -> profile row. First user = super_admin, everyone else pending.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('samantroy_role_guard')::bigint);
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when (select count(*) from public.profiles) = 0 then 'super_admin' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Never allow the LAST super-admin to be demoted or deleted.
create or replace function private.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  supers int;
begin
  perform pg_advisory_xact_lock(hashtext('samantroy_role_guard')::bigint);

  if (tg_op = 'DELETE') then
    if old.role = 'super_admin' then
      select count(*) into supers from public.profiles where role = 'super_admin';
      if supers <= 1 then
        raise exception 'Cannot remove the last super admin.';
      end if;
    end if;
    return old;
  end if;

  if old.role = 'super_admin' and new.role <> 'super_admin' then
    select count(*) into supers from public.profiles where role = 'super_admin';
    if supers <= 1 then
      raise exception 'Cannot demote the last super admin.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_last_super_admin on public.profiles;
create trigger trg_protect_last_super_admin
  before update or delete on public.profiles
  for each row execute function private.protect_last_super_admin();

-- ─────────────────────────────────────────────────────────────
-- 2. SITE CONTENT  (one row per section; draft + published documents)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_content (
  key         text primary key,          -- e.g. 'hero', 'settings', 'seo.home', 'pagehero.exams'
  label       text,
  draft       jsonb not null default '{}'::jsonb,
  published   jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);
alter table public.site_content enable row level security;

drop policy if exists "content_admin_all" on public.site_content;
create policy "content_admin_all" on public.site_content
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- Anon reads PUBLISHED only; the draft column does not exist in this view.
create or replace view public.published_content as
  select key, published from public.site_content;

-- ─────────────────────────────────────────────────────────────
-- 3. CONTENT VERSIONS  (snapshot per publish, for rollback)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.content_versions (
  id          bigint generated always as identity primary key,
  key         text not null,
  snapshot    jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);
alter table public.content_versions enable row level security;

drop policy if exists "versions_admin_all" on public.content_versions;
create policy "versions_admin_all" on public.content_versions
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- ─────────────────────────────────────────────────────────────
-- 4. SELECTED CANDIDATES  (Wall of Selection)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.selected_candidates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  exam         text not null,             -- e.g. 'SSC GD Constable'
  post         text,                      -- e.g. 'Constable (GD), CRPF'
  force        text,                      -- Army / Navy / Air Force / CAPF / Odisha Police / Railways
  year         int,
  image_path   text,
  selected_on  date,                      -- orders the wall latest-first
  sort_order   int not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.selected_candidates enable row level security;

drop policy if exists "candidates_admin_all" on public.selected_candidates;
create policy "candidates_admin_all" on public.selected_candidates
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_selected_candidates as
  select id, name, exam, post, force, year, image_path, sort_order, selected_on
  from public.selected_candidates where published = true;

-- ─────────────────────────────────────────────────────────────
-- 5. TESTIMONIALS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  rank        text,
  body        text not null,
  image_path  text,
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.testimonials enable row level security;

drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_admin_all" on public.testimonials
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_testimonials as
  select id, name, rank, body, image_path, sort_order
  from public.testimonials where published = true;

-- ─────────────────────────────────────────────────────────────
-- 6. MENTORS  (Faculty & physical trainers)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.mentors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  specialty   text,
  bio         text,
  image_path  text,
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.mentors enable row level security;

drop policy if exists "mentors_admin_all" on public.mentors;
create policy "mentors_admin_all" on public.mentors
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_mentors as
  select id, name, role, specialty, bio, image_path, sort_order
  from public.mentors where published = true;

-- ─────────────────────────────────────────────────────────────
-- 7. FAQS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,             -- rich HTML
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.faqs enable row level security;

drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all" on public.faqs
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_faqs as
  select id, question, answer, sort_order from public.faqs where published = true;

-- ─────────────────────────────────────────────────────────────
-- 8. MEDIA LIBRARY  (metadata; files live in Storage)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,
  alt         text,
  width       int,
  height      int,
  uploaded_by uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
alter table public.media enable row level security;

drop policy if exists "media_admin_all" on public.media;
create policy "media_admin_all" on public.media
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- ─────────────────────────────────────────────────────────────
-- 9. ACTIVITY LOG  (append-only audit trail: no update/delete policy)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id          bigint generated always as identity primary key,
  actor       uuid references auth.users(id),
  actor_email text,
  action      text not null,
  target      text,
  created_at  timestamptz not null default now()
);
alter table public.activity_log enable row level security;

drop policy if exists "activity_admin_read" on public.activity_log;
create policy "activity_admin_read" on public.activity_log
  for select to authenticated using ( private.is_admin() );

drop policy if exists "activity_admin_insert" on public.activity_log;
create policy "activity_admin_insert" on public.activity_log
  for insert to authenticated with check ( private.is_admin() );

-- ─────────────────────────────────────────────────────────────
-- 10. GRANTS  (PostgREST checks grants first, then RLS narrows rows)
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.site_content, public.content_versions,
  public.selected_candidates, public.testimonials, public.mentors,
  public.faqs, public.media, public.activity_log
  to authenticated;

grant select on
  public.published_content, public.published_selected_candidates,
  public.published_testimonials, public.published_mentors, public.published_faqs
  to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 11. STORAGE  (public 'media' bucket; admins write, everyone reads)
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated using ( bucket_id = 'media' );

-- Upsert needs INSERT + SELECT + UPDATE for admins.
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check ( bucket_id = 'media' and private.is_admin() );

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using ( bucket_id = 'media' and private.is_admin() )
  with check ( bucket_id = 'media' and private.is_admin() );

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using ( bucket_id = 'media' and private.is_admin() );

-- ============================================================================
-- Next: run 0002_features.sql, 0003_resources.sql, 0004_exams_standards.sql,
-- then the seed files. Create your first admin under Authentication -> Add
-- user; that first user becomes SUPER_ADMIN automatically.
-- ============================================================================

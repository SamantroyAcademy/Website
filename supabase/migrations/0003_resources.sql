-- ============================================================================
-- Resources centre - admin-managed folders + downloadable files + YouTube links.
-- Public read (visitors browse & download); admin writes.
-- The kind='youtube' rows ALSO feed the homepage video grid (lib/videos.ts).
-- ============================================================================

create table if not exists public.resource_folders (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  parent_id  uuid references public.resource_folders(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.resource_folders enable row level security;

create table if not exists public.resources (
  id         uuid primary key default gen_random_uuid(),
  folder_id  uuid references public.resource_folders(id) on delete cascade,
  kind       text not null default 'file' check (kind in ('file','youtube')),
  title      text not null,
  path       text,           -- storage path (files)
  url        text,           -- external url (youtube)
  mime       text,
  thumbnail  text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.resources enable row level security;

drop policy if exists "rf_admin_all" on public.resource_folders;
create policy "rf_admin_all" on public.resource_folders for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );
drop policy if exists "res_admin_all" on public.resources;
create policy "res_admin_all" on public.resources for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

drop policy if exists "rf_public_read" on public.resource_folders;
create policy "rf_public_read" on public.resource_folders for select to anon, authenticated using ( true );
drop policy if exists "res_public_read" on public.resources;
create policy "res_public_read" on public.resources for select to anon, authenticated using ( true );

grant select, insert, update, delete on public.resource_folders, public.resources to authenticated;
grant select on public.resource_folders, public.resources to anon;

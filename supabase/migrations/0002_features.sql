-- ============================================================================
-- SAMANTROY ACADEMY CMS - feature tables
--   Enquiry CRM · Blog · Selection tracker · Mock tests · Analytics
-- Depends on 0001 (private.is_admin, media bucket).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENQUIRIES  (lead CRM - inserted by trusted server code only)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,                          -- '' when the form hides email
  phone       text,                                   -- stored as +91XXXXXXXXXX
  entry       text,                                   -- target exam
  message     text,
  source      text not null default 'contact_form',   -- contact_form | eligibility | mock_test
  status      text not null default 'new' check (status in ('new','contacted','enrolled','dropped')),
  notes       text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
alter table public.enquiries enable row level security;

-- Admins read/update/delete. There is deliberately NO anon insert policy:
-- leads are inserted server-side with the service role (lib/enquiries.ts).
drop policy if exists "enquiries_admin_all" on public.enquiries;
create policy "enquiries_admin_all" on public.enquiries
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
grant select, insert, update, delete on public.enquiries to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. BLOG POSTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  cover_path   text,
  body         text not null default '',
  tag          text,
  author       text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.posts enable row level security;

drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all" on public.posts
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- Date-gated publishing: public only once published_at has passed.
create or replace view public.published_posts as
  select id, slug, title, excerpt, cover_path, body, tag, author, published_at
  from public.posts
  where published = true and (published_at is null or published_at <= now());

grant select, insert, update, delete on public.posts to authenticated;
grant select on public.published_posts to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. SELECTIONS  (results tracker: year / exam / district-or-force counts)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.selections (
  id          uuid primary key default gen_random_uuid(),
  year        int not null,
  exam        text not null,
  center      text,                        -- district or force
  count       int not null default 1,
  sort_order  int not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.selections enable row level security;

drop policy if exists "selections_admin_all" on public.selections;
create policy "selections_admin_all" on public.selections
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_selections as
  select id, year, exam, center, count, sort_order
  from public.selections where published = true;

grant select, insert, update, delete on public.selections to authenticated;
grant select on public.published_selections to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4. MOCK QUESTIONS  (subject-wise MCQ, real CBT marking)
--    exam_id FK is added in 0004 once the exams table exists.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.mock_questions (
  id             uuid primary key default gen_random_uuid(),
  type           text not null default 'MCQ' check (type in ('MCQ','TF')),
  subject        text not null default 'GK',
  exam_id        uuid,
  question       text not null,
  options        jsonb not null default '[]'::jsonb,   -- string[]
  answer         int,                                   -- index into options
  explanation    text,
  difficulty     text default 'medium',
  marks          numeric not null default 1,
  negative_marks numeric not null default 0.25,
  sort_order     int not null default 0,
  published      boolean not null default true,
  created_at     timestamptz not null default now()
);
alter table public.mock_questions enable row level security;

drop policy if exists "mock_admin_all" on public.mock_questions;
create policy "mock_admin_all" on public.mock_questions
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- The public view HIDES answer & explanation so the quiz cannot be completed
-- from the network tab. Scoring happens server-side in /api/mock/score.
create or replace view public.published_mock_questions as
  select id, type, subject, exam_id, question, options, difficulty,
         marks, negative_marks, sort_order
  from public.mock_questions where published = true;

grant select, insert, update, delete on public.mock_questions to authenticated;
grant select on public.published_mock_questions to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. ANALYTICS  (privacy-friendly aggregate page views; no personal data)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.page_view_daily (
  path   text not null,
  day    date not null,
  views  int  not null default 0,
  primary key (path, day)
);
alter table public.page_view_daily enable row level security;

drop policy if exists "pv_admin_read" on public.page_view_daily;
create policy "pv_admin_read" on public.page_view_daily
  for select to authenticated using ( private.is_admin() );

-- Visitors increment counts ONLY through this RPC, which validates and
-- normalises the path. No direct table write is exposed.
create or replace function public.track_view(p text)
returns void language plpgsql security definer set search_path = '' as $$
declare clean text;
begin
  clean := split_part(split_part(coalesce(p,'/'), '?', 1), '#', 1);
  if clean = '' or left(clean,1) <> '/' then clean := '/'; end if;
  if length(clean) > 120 then clean := left(clean,120); end if;
  insert into public.page_view_daily (path, day, views)
  values (clean, current_date, 1)
  on conflict (path, day) do update set views = public.page_view_daily.views + 1;
end;
$$;

grant execute on function public.track_view(text) to anon, authenticated;
grant select on public.page_view_daily to authenticated;

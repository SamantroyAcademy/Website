-- ============================================================================
-- Samantroy-specific tables (the only structural deviation from the reference
-- build - see blueprint section 2.2):
--   exams               the exam catalogue, one row per exam, own detail page
--   physical_standards  PST / PET benchmark rows per exam x gender x category
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EXAMS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.exams (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_name         text,
  vertical           text not null check (vertical in ('armed-forces','capf','odisha','railways','ssc','officer')),
  force              text,
  stage              text,               -- After 10th / After 12th / After Graduation / ...
  qualification      text,
  age_min            int,
  age_max            int,
  gender             text not null default 'both' check (gender in ('male','female','both')),
  marital_status     text,
  domicile           text,
  intro              text,               -- rich HTML
  pattern            text,               -- rich HTML
  syllabus           text,               -- rich HTML
  salary             text,               -- rich HTML
  stages             jsonb not null default '[]'::jsonb,
  notification_month text,
  exam_month         text,
  official_url       text,
  banner_path        text,
  sort_order         int not null default 0,
  published          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.exams enable row level security;

drop policy if exists "exams_admin_all" on public.exams;
create policy "exams_admin_all" on public.exams
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_exams as
  select id, slug, name, short_name, vertical, force, stage, qualification,
         age_min, age_max, gender, marital_status, domicile, intro, pattern,
         syllabus, salary, stages, notification_month, exam_month,
         official_url, banner_path, sort_order
  from public.exams where published = true;

create index if not exists exams_vertical_idx on public.exams (vertical);

grant select, insert, update, delete on public.exams to authenticated;
grant select on public.published_exams to anon, authenticated;

-- Scope mock questions to an exam (optional).
alter table public.mock_questions drop constraint if exists mock_questions_exam_fk;
alter table public.mock_questions
  add constraint mock_questions_exam_fk foreign key (exam_id)
  references public.exams(id) on delete set null;

-- ─────────────────────────────────────────────────────────────
-- 2. PHYSICAL STANDARDS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.physical_standards (
  id                uuid primary key default gen_random_uuid(),
  exam_id           uuid references public.exams(id) on delete cascade,
  label             text,                -- free-text scope, e.g. 'ST candidates, Odisha'
  gender            text not null default 'male' check (gender in ('male','female')),
  category          text not null default 'UR',
  region            text,
  -- PST
  height_cm         numeric,
  chest_cm          numeric,
  chest_expanded_cm numeric,
  weight_kg         text,
  -- PET
  run_distance_m    int,
  run_time          text,
  long_jump         text,
  high_jump         text,
  beam_pullups      text,
  ditch             text,
  zigzag            text,
  -- other
  vision            text,
  notes             text,
  sort_order        int not null default 0,
  published         boolean not null default true,
  created_at        timestamptz not null default now()
);
alter table public.physical_standards enable row level security;

drop policy if exists "ps_admin_all" on public.physical_standards;
create policy "ps_admin_all" on public.physical_standards
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

create or replace view public.published_physical_standards as
  select id, exam_id, label, gender, category, region,
         height_cm, chest_cm, chest_expanded_cm, weight_kg,
         run_distance_m, run_time, long_jump, high_jump,
         beam_pullups, ditch, zigzag, vision, notes, sort_order
  from public.physical_standards where published = true;

create index if not exists ps_exam_idx on public.physical_standards (exam_id);

grant select, insert, update, delete on public.physical_standards to authenticated;
grant select on public.published_physical_standards to anon, authenticated;

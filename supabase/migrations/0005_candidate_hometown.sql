-- Selected candidates: hometown ("Aska, Ganjam"), as printed on the academy's
-- result posters. Shown on the Wall of Selection under the exam.
alter table public.selected_candidates add column if not exists hometown text;

create or replace view public.published_selected_candidates as
  select id, name, exam, post, force, year, image_path, sort_order, selected_on, hometown
  from public.selected_candidates where published = true;

grant select on public.published_selected_candidates to anon, authenticated;

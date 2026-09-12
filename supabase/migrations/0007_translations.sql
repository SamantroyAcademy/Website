-- Odia translations of the site's English text (navbar switch EN / ଓଡ଼ିଆ).
-- Every visible string is a row keyed by its exact English text; the sync job
-- (lib/i18n/sync.ts) fills `odia` through OpenRouter's free models whenever an
-- admin saves, and publishes all finished rows as one dictionary file on R2.
-- Admins can read and correct rows; the public never reads this table.

create table if not exists public.translations (
  source     text primary key check (char_length(source) between 1 and 4000),
  source_html text,          -- for kind = html: the markup to translate (source is its plain text)
  odia       text,
  kind       text not null default 'text' check (kind in ('text', 'html')),
  status     text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  attempts   int not null default 0,
  model      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists translations_status_idx on public.translations (status);

alter table public.translations enable row level security;

drop policy if exists "translations_admin_all" on public.translations;
create policy "translations_admin_all" on public.translations
  for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

grant select, insert, update, delete on public.translations to authenticated;

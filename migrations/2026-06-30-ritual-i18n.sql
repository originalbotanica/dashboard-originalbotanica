-- Spanish content columns for the ritual library.
--
-- title_es already exists from the initial schema. Add the rest of the
-- member-visible fields so the library can render in Spanish. Each is nullable;
-- queries fall back to the English column when the Spanish one is empty, so the
-- app keeps working before/while the translation job runs.

alter table public.rituals add column if not exists summary_es  text;
alter table public.rituals add column if not exists steps_es    jsonb not null default '[]';
alter table public.rituals add column if not exists warnings_es text;

-- Spanish trigram search, mirroring the English indexes (ignore if pg_trgm
-- is unavailable).
create index if not exists rituals_title_es_trgm
  on public.rituals using gin (title_es gin_trgm_ops);
create index if not exists rituals_summary_es_trgm
  on public.rituals using gin (summary_es gin_trgm_ops);

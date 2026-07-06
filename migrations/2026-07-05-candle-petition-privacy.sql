-- Candle petition privacy
--
-- A candle can be shared on the community altar (is_public = true) while its
-- longer petition stays private. Before this, a public candle exposed its
-- petition to every member who opened it. We add a separate flag so the
-- dedication can be public while the petition is not, and default it to
-- false so existing public candles keep their petitions private from here on.

alter table public.candles
  add column if not exists petition_public boolean not null default false;

comment on column public.candles.petition_public is
  'When true, the petition is shown to others on a public candle. When false, the petition is visible only to the owner even if the candle is public.';

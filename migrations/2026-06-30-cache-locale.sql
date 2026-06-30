-- Cache generated readings per language.
--
-- daily_horoscopes and forecasts were keyed on (sign,date) / (user_id,month),
-- so they could only hold one language and Spanish had to regenerate every
-- view. Add a `locale` column (existing rows default to 'en') and fold it into
-- the primary key so each language caches independently.

alter table public.daily_horoscopes add column if not exists locale text not null default 'en';
alter table public.daily_horoscopes drop constraint daily_horoscopes_pkey;
alter table public.daily_horoscopes add primary key (sign, date, locale);

alter table public.forecasts add column if not exists locale text not null default 'en';
alter table public.forecasts drop constraint forecasts_pkey;
alter table public.forecasts add primary key (user_id, month, locale);

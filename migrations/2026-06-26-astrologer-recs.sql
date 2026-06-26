-- Astrologer reading recommendations.
--
-- Stores the archive rituals + shop products that grounded each astrologer
-- reading, so we can show a tappable "For this reading" cards block under the
-- answer (matching the Monthly Forecast and Compatibility readings). The
-- astrologer already retrieves these to write the ritual; this just persists
-- them. Safe to run once; uses "if not exists".

alter table public.astrologer_messages
  add column if not exists ritual_slugs  text[] not null default '{}',
  add column if not exists product_slugs text[] not null default '{}';

-- Same for the dream interpreter, so dream readings can show their own
-- "For this dream" cards block.
alter table public.dream_messages
  add column if not exists ritual_slugs  text[] not null default '{}',
  add column if not exists product_slugs text[] not null default '{}';

-- Ancestors altar — port of ancestors-originalbotanica into the membership.
--
-- The `ancestors` table already exists from the Phase 0 schema. This
-- migration adds the columns needed for shareable public URLs and the
-- "add my light" anonymous counter, plus the Storage bucket for
-- memorial photos and the public-read RLS policy for shared memorials.

-- ── columns ────────────────────────────────────────────────────────────────
alter table public.ancestors
  add column if not exists hash         text,
  add column if not exists is_public    boolean not null default true,
  add column if not exists light_count  integer not null default 0;

-- Backfill any pre-existing rows with a random hash (none today, but safe).
update public.ancestors
   set hash = encode(gen_random_bytes(8), 'base64')
 where hash is null;

-- Make hash required + unique going forward.
alter table public.ancestors
  alter column hash set not null;

create unique index if not exists ancestors_hash_idx on public.ancestors(hash);
create index if not exists ancestors_public_idx
  on public.ancestors(is_public) where is_public = true;

-- ── RLS: allow public read of memorials marked public ─────────────────────
-- The owner can still always read their own (existing policy from phase 0).
-- This adds an OR for anonymous + non-owner authenticated users to read
-- memorials with is_public = true. Used by /candle/[hash] share pages.
drop policy if exists "ancestors_select_public" on public.ancestors;
create policy "ancestors_select_public" on public.ancestors
  for select using (is_public = true);

-- ── Storage bucket for memorial photos ────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('ancestor-photos', 'ancestor-photos', true)
on conflict (id) do nothing;

-- Storage policies: any authenticated user can upload, anyone can read.
-- (Folder structure ensures one member can't see another member's raw
-- uploads — but since the photo URLs become part of shared memorial
-- pages, public read access is necessary.)
drop policy if exists "ancestor_photos_read_all" on storage.objects;
create policy "ancestor_photos_read_all" on storage.objects
  for select using (bucket_id = 'ancestor-photos');

drop policy if exists "ancestor_photos_insert_own" on storage.objects;
create policy "ancestor_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'ancestor-photos'
    and auth.uid() is not null
  );

drop policy if exists "ancestor_photos_delete_own" on storage.objects;
create policy "ancestor_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'ancestor-photos'
    and owner = auth.uid()
  );

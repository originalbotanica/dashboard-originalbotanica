-- Ancestor offerings: a second devotional act on a memorial, beside the
-- candle. Members (and family via the public /candle/[hash] link) can set
-- fresh water, flowers, black coffee, or ancestor money on the altar.
-- Guest offerings are written by the service role with user_id null.
--
-- Run in the Supabase SQL Editor (originalbotanica-membership project).

create table if not exists public.ancestor_offerings (
  id uuid primary key default gen_random_uuid(),
  ancestor_id uuid not null references public.ancestors(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  offering_type text not null
    check (offering_type in ('water', 'flowers', 'coffee', 'ancestor_money')),
  created_at timestamptz not null default now()
);

create index if not exists ancestor_offerings_ancestor_idx
  on public.ancestor_offerings (ancestor_id, created_at desc);

alter table public.ancestor_offerings enable row level security;

-- The memorial's owner can see every offering on it (including the
-- anonymous family ones).
create policy "offerings_select_owner" on public.ancestor_offerings
  for select using (
    exists (
      select 1 from public.ancestors a
      where a.id = ancestor_id and a.user_id = auth.uid()
    )
  );

-- A member may add an offering only to their own memorial, as themselves.
create policy "offerings_insert_owner" on public.ancestor_offerings
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ancestors a
      where a.id = ancestor_id and a.user_id = auth.uid()
    )
  );

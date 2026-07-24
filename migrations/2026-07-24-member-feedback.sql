-- Member feedback: the quiet "Share your thoughts" box in the member
-- area. Entries are private to the house — members can write, only the
-- service role reads (via the Supabase dashboard).
--
-- Run in the Supabase SQL Editor (originalbotanica-membership project).

create table if not exists public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists member_feedback_created_idx
  on public.member_feedback (created_at desc);

alter table public.member_feedback enable row level security;

-- Members may leave feedback as themselves. No select policy: entries
-- are read only with the service role.
create policy "feedback_insert_own" on public.member_feedback
  for insert with check (auth.uid() = user_id);

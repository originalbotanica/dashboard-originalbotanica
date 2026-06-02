-- Dream interpretation tool — schema
--
-- Each dream is its own thread (unlike the astrologer's single rolling
-- thread). The Dream Journal at /dreams lists all past threads.
--
-- Same RLS pattern as the astrology tables: members read/write their own,
-- writes that need to bypass RLS go through the service role.

create table if not exists public.dream_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- Auto-generated short title from the first message (~40 chars).
  title       text not null default 'A dream',
  -- Optional dreamt-on date so the journal can sort by when the dream
  -- happened, not when it was interpreted.
  dreamt_on   date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists dream_threads_user_idx
  on public.dream_threads(user_id, created_at desc);

create table if not exists public.dream_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.dream_threads(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists dream_messages_thread_idx
  on public.dream_messages(thread_id, created_at);
create index if not exists dream_messages_user_idx
  on public.dream_messages(user_id, created_at desc);

create table if not exists public.dream_usage (
  user_id        uuid not null references auth.users(id) on delete cascade,
  usage_date     date not null,
  message_count  integer not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, usage_date)
);

-- RLS
alter table public.dream_threads  enable row level security;
alter table public.dream_messages enable row level security;
alter table public.dream_usage    enable row level security;

drop policy if exists "dream_threads_select_own" on public.dream_threads;
drop policy if exists "dream_threads_insert_own" on public.dream_threads;
drop policy if exists "dream_threads_update_own" on public.dream_threads;
drop policy if exists "dream_threads_delete_own" on public.dream_threads;
create policy "dream_threads_select_own" on public.dream_threads
  for select using (auth.uid() = user_id);
create policy "dream_threads_insert_own" on public.dream_threads
  for insert with check (auth.uid() = user_id);
create policy "dream_threads_update_own" on public.dream_threads
  for update using (auth.uid() = user_id);
create policy "dream_threads_delete_own" on public.dream_threads
  for delete using (auth.uid() = user_id);

drop policy if exists "dream_messages_select_own" on public.dream_messages;
drop policy if exists "dream_messages_insert_own" on public.dream_messages;
create policy "dream_messages_select_own" on public.dream_messages
  for select using (auth.uid() = user_id);
create policy "dream_messages_insert_own" on public.dream_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "dream_usage_select_own" on public.dream_usage;
create policy "dream_usage_select_own" on public.dream_usage
  for select using (auth.uid() = user_id);

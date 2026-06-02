-- =========================================================================
-- RAG corpus: blog posts + product catalog from originalbotanica.com
--
-- Run this in Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- =========================================================================

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Product catalog
--    One row per OB.com product. Populated by the ingestion script.
create table if not exists public.ob_products (
  slug          text        primary key,
  url           text        not null,
  name          text        not null,
  image_url     text,
  last_seen_at  timestamptz not null default now()
);

create index if not exists ob_products_name_trgm
  on public.ob_products using gin (name gin_trgm_ops);
-- ^ this requires pg_trgm; ignore failure if not present
-- We can fall back to ilike searches without it.

alter table public.ob_products enable row level security;

drop policy if exists "Public read products" on public.ob_products;
create policy "Public read products"
  on public.ob_products
  for select
  to anon, authenticated
  using (true);

-- 3. Blog corpus
--    One row per OB.com blog post. Vector dim 1024 matches Voyage 3.5.
create table if not exists public.ritual_posts (
  slug             text        primary key,
  url              text        not null,
  title            text        not null,
  description      text,
  keywords         text[],
  body_excerpt     text        not null,
  image_url        text,
  embedding        vector(1024),
  product_slugs    text[]      not null default '{}',
  last_fetched_at  timestamptz not null default now()
);

-- Vector similarity index (cosine distance)
create index if not exists ritual_posts_embedding_idx
  on public.ritual_posts
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.ritual_posts enable row level security;

drop policy if exists "Public read ritual posts" on public.ritual_posts;
create policy "Public read ritual posts"
  on public.ritual_posts
  for select
  to anon, authenticated
  using (true);

-- 4. RPC: vector search wrapper
--    Server-side function our app calls to fetch the top N posts
--    matching a query embedding. SECURITY DEFINER so callers don't need
--    direct read access to the embedding column.
create or replace function public.match_ritual_posts(
  query_embedding vector(1024),
  match_count int default 3
)
returns table (
  slug          text,
  url           text,
  title         text,
  description   text,
  body_excerpt  text,
  image_url     text,
  product_slugs text[],
  similarity    float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    rp.slug,
    rp.url,
    rp.title,
    rp.description,
    rp.body_excerpt,
    rp.image_url,
    rp.product_slugs,
    1 - (rp.embedding <=> query_embedding) as similarity
  from public.ritual_posts rp
  where rp.embedding is not null
  order by rp.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_ritual_posts(vector, int)
  to anon, authenticated;

-- =========================================================================
-- Done. After this runs:
--   1. Set VOYAGE_API_KEY in Vercel env vars
--   2. Run the ingestion script (see scripts/rag-ingest.ts)
-- =========================================================================

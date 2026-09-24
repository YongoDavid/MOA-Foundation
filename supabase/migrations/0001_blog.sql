-- Blog schema — posts and comments.
--
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It is idempotent, so running it twice is harmless.
--
-- Two decisions from the client, 24 September 2026, are baked in here:
--   1. Posts live in the DATABASE, not in fixtures, so publishing needs no
--      developer.
--   2. Comments publish IMMEDIATELY, with no approval queue. That choice is
--      what makes the anonymous-insert policy below necessary, and it is why
--      the constraints on that table are strict rather than polite.

-- ── enums ───────────────────────────────────────────────────────────────────
-- Unions, not free text. They mirror src/lib/blog-types.ts exactly; if one
-- side changes the other must change with it.
do $$ begin
  create type post_type as enum ('gallery', 'video', 'story');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_category as enum ('partnerships', 'governance', 'advocacy', 'summits');
exception when duplicate_object then null; end $$;

-- ── posts ───────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  excerpt        text not null default '',
  type           post_type not null default 'story',
  category       post_category not null,
  status         post_status not null default 'draft',
  -- MediaItem {url, alt, width, height}. null for story posts, which have no
  -- cover by design.
  cover          jsonb,
  author         text not null default 'Comms Team',
  published_at   date not null default current_date,
  read_time      integer not null default 3 check (read_time between 1 and 60),
  media_count    integer check (media_count >= 0),
  video_duration text,
  tags           text[] not null default '{}',
  featured       boolean not null default false,
  -- The Block[] union from blog-types.ts. Kept as jsonb rather than modelled
  -- into tables: it is an ordered, heterogeneous document, and the editor
  -- rewrites the whole array on save. Normalising it would buy nothing.
  blocks         jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- The index the blog index page actually uses: published, newest first.
create index if not exists posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

create index if not exists posts_category_idx
  on public.posts (category, published_at desc)
  where status = 'published';

-- At most one featured post. A second one would silently win or lose
-- depending on sort order, which is the kind of bug nobody reports.
create unique index if not exists posts_single_featured_idx
  on public.posts ((featured))
  where featured and status = 'published';

-- ── comments ────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_slug  text not null references public.posts (slug) on delete cascade,
  -- One nesting level only, matching CommentThread: a reply points at a
  -- top-level comment, never at another reply. Enforced by the trigger below.
  parent_id  uuid references public.comments (id) on delete cascade,
  name       text not null check (length(btrim(name)) between 1 and 80),
  -- Accepted on create, NEVER returned. The read policy below selects
  -- specific columns for exactly this reason.
  email      text check (email is null or length(email) <= 254),
  is_staff   boolean not null default false,
  body       text not null check (length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  like_count integer not null default 0 check (like_count >= 0)
);

create index if not exists comments_post_idx
  on public.comments (post_slug, created_at desc);

-- Enforce the single nesting level. Without this a client can build a chain
-- of replies that the UI cannot render.
create or replace function public.comments_reject_deep_nesting()
returns trigger language plpgsql as $$
begin
  if new.parent_id is not null then
    if exists (select 1 from public.comments c
               where c.id = new.parent_id and c.parent_id is not null) then
      raise exception 'comments nest one level only';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists comments_nesting_guard on public.comments;
create trigger comments_nesting_guard
  before insert or update on public.comments
  for each row execute function public.comments_reject_deep_nesting();

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ── row level security ──────────────────────────────────────────────────────
-- RLS is the real access control. The publishable key ships to every browser
-- by design, so anything not forbidden here is public. Assume the key is known.
alter table public.posts    enable row level security;
alter table public.comments enable row level security;

-- Anyone may read PUBLISHED posts. Drafts are invisible without a session,
-- which is what makes "save as draft" mean anything.
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
  for select using (status = 'published');

-- The single shared admin account may do anything to posts.
drop policy if exists posts_admin_all on public.posts;
create policy posts_admin_all on public.posts
  for all to authenticated using (true) with check (true);

-- Comments are readable by anyone.
drop policy if exists comments_public_read on public.comments;
create policy comments_public_read on public.comments
  for select using (true);

-- ...and writable by anyone, because the client chose immediate publication.
-- The guard rails are therefore constraints, not a review step:
--   * is_staff cannot be set from the public side — only the admin can wear
--     the FOUNDATION badge, or anyone could impersonate the Foundation.
--   * like_count cannot be seeded.
--   * the post must exist and be published: no commenting on a draft.
drop policy if exists comments_public_insert on public.comments;
create policy comments_public_insert on public.comments
  for insert with check (
    is_staff = false
    and like_count = 0
    and exists (
      select 1 from public.posts p
      where p.slug = post_slug and p.status = 'published'
    )
  );

-- Only the admin may edit or remove a comment. This is the Delete control
-- that is deliberately absent from the public DOM.
drop policy if exists comments_admin_write on public.comments;
create policy comments_admin_write on public.comments
  for update to authenticated using (true) with check (true);

drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete on public.comments
  for delete to authenticated using (true);

-- ── a view that cannot leak the commenter's email ───────────────────────────
-- Belt and braces. Application code should select columns explicitly, but a
-- view means a careless `select *` still cannot return an address someone
-- gave us in confidence.
create or replace view public.comments_public
with (security_invoker = true) as
  select id, post_slug, parent_id, name, is_staff, body, created_at, like_count
  from public.comments;

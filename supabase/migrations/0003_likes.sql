-- Liking a comment.
--
-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- A function rather than an UPDATE policy, for two reasons.
--
-- ATOMICITY. Read-then-write from the client loses clicks: two people liking
-- at the same moment both read 4, both write 5, and one like disappears.
-- `set like_count = like_count + 1` happens inside the database, so it cannot.
--
-- BLAST RADIUS. Granting anonymous UPDATE on comments to allow liking would
-- also let anyone rewrite the body of any comment. SECURITY DEFINER lets this
-- one function touch that one column with nothing else opened up.
--
-- The client asked for unlimited likes (25 Sep 2026) — no per-visitor guard,
-- the same person may click as often as they wish. So the counter is a measure
-- of enthusiasm, not of people, and nothing here pretends otherwise.
create or replace function public.increment_comment_like(comment_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.comments
     set like_count = like_count + 1
   where id = comment_id
  returning like_count;
$$;

revoke all on function public.increment_comment_like(uuid) from public;
grant execute on function public.increment_comment_like(uuid) to anon, authenticated;

-- Video storage.
--
-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Idempotent.
--
-- A SEPARATE BUCKET, not a bigger blog-media. Three reasons, and the third is
-- the one that matters:
--
--   1. The limits stay meaningful. Raising blog-media to 50 MB would silently
--      permit 50 MB images too, and the 10 MB image rule would survive only
--      in application code.
--   2. Video is the only thing here that needs video/mp4.
--   3. EGRESS IS MEASURABLE. The free plan allows 5 GB a month and video is
--      served straight to the visitor, so every view costs its full size.
--      With one shared bucket the dashboard cannot tell you what is consuming
--      the allowance. With two, it can.
--
-- 50 MB is the ceiling this project's plan permits: asked for 50, 100 and 200,
-- and only 50 was accepted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-video',
  'blog-video',
  true,
  52428800,                 -- 50 MiB
  array['video/mp4']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read: the <video> element fetches this directly from the browser.
drop policy if exists blog_video_public_read on storage.objects;
create policy blog_video_public_read on storage.objects
  for select using (bucket_id = 'blog-video');

-- WHAT ACTUALLY GATES AN UPLOAD IS THE TICKET, NOT THESE POLICIES.
-- Measured, not assumed: a signed upload token was redeemed successfully
-- against this bucket before any policy existed. Supabase treats the token as
-- the authorisation and skips RLS. Only a signed-in admin can obtain one
-- (see requestUpload), so that is the real boundary.
--
-- These are kept as defence in depth: they govern any code path that writes
-- with a client session instead of a ticket, and they make the intent
-- explicit. Without them the table default-denies anyway. Do not read them as
-- the thing stopping a stranger uploading — read requestUpload for that.
drop policy if exists blog_video_admin_insert on storage.objects;
create policy blog_video_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-video');

drop policy if exists blog_video_admin_update on storage.objects;
create policy blog_video_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'blog-video');

drop policy if exists blog_video_admin_delete on storage.objects;
create policy blog_video_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'blog-video');

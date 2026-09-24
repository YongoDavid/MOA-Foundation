-- Storage for blog media.
--
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Idempotent, like 0001.
--
-- WHY STORAGE AND NOT THE REPO. Until now every image on this site was a
-- static import, which Next resolves to a content-hashed filename at BUILD
-- time. A database row cannot reference that: the name is not known when the
-- row is written and changes whenever the file does. Once posts are authored
-- in the admin rather than in a fixtures file, their images have to live
-- somewhere with a stable URL that a non-developer can add to.
--
-- Only BLOG media moves here. The nineteen gallery photographs and the site
-- furniture stay as static imports — they are not CMS-managed, and static
-- imports give next/image the real intrinsic dimensions for free.

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

-- Public read. The bucket is public anyway; this makes the intent explicit and
-- survives someone flipping the bucket flag.
drop policy if exists blog_media_public_read on storage.objects;
create policy blog_media_public_read on storage.objects
  for select using (bucket_id = 'blog-media');

-- Only the signed-in admin may add, replace or remove media. Anonymous upload
-- to a public bucket is free hosting for whoever finds it.
drop policy if exists blog_media_admin_insert on storage.objects;
create policy blog_media_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-media');

drop policy if exists blog_media_admin_update on storage.objects;
create policy blog_media_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'blog-media');

drop policy if exists blog_media_admin_delete on storage.objects;
create policy blog_media_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'blog-media');

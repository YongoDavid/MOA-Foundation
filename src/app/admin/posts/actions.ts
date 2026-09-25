"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient, getAdminUser } from "@/lib/supabase/server"
import type { Block, MediaItem } from "@/lib/blog-types"

const BUCKET = "blog-media"

export type SaveState = { error?: string; ok?: boolean }

/** Slugify a title the same way a human would, and predictably. */
export async function slugify(input: string): Promise<string> {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

type PostInput = {
  slug: string
  originalSlug: string | null
  title: string
  excerpt: string
  type: string
  category: string
  status: string
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  featured: boolean
  cover: MediaItem | null
  blocks: Block[]
  mediaCount: number | null
  videoDuration: string | null
}

export async function savePost(
  _prev: SaveState,
  form: FormData,
): Promise<SaveState> {
  if (!(await getAdminUser())) return { error: "Your session has expired. Sign in again." }

  let input: PostInput
  try {
    input = JSON.parse(String(form.get("payload") ?? "")) as PostInput
  } catch {
    return { error: "The editor sent something malformed. Reload and try again." }
  }

  const slug = (await slugify(input.slug || input.title)).trim()
  if (!slug) return { error: "A slug is required — give the post a title." }
  if (!input.title.trim()) return { error: "A title is required." }

  const supabase = await createSupabaseServerClient()

  const row = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    type: input.type,
    category: input.category,
    status: input.status,
    author: input.author.trim() || "Comms Team",
    published_at: input.publishedAt,
    read_time: Number(input.readTime) || 3,
    tags: input.tags,
    featured: input.featured,
    cover: input.cover,
    blocks: input.blocks,
    media_count: input.mediaCount,
    video_duration: input.videoDuration,
  }

  // Only one post may be featured (there is a partial unique index). Clear the
  // previous holder first rather than letting the insert fail with a
  // constraint error the author cannot act on.
  if (row.featured && row.status === "published") {
    await supabase
      .from("posts")
      .update({ featured: false })
      .eq("featured", true)
      .neq("slug", slug)
  }

  const { error } = input.originalSlug
    ? await supabase.from("posts").update(row).eq("slug", input.originalSlug)
    : await supabase.from("posts").insert(row)

  if (error) {
    // 23505 is a unique violation, which here means the slug is taken.
    if (error.code === "23505") {
      return { error: `A post with the slug "${slug}" already exists.` }
    }
    console.error("[savePost]", error.code, error.message)
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  redirect(`/admin/posts/${slug}?saved=1`)
}

export async function deletePost(form: FormData) {
  if (!(await getAdminUser())) redirect("/admin/login")
  const slug = String(form.get("slug") ?? "")
  if (!slug) return

  const supabase = await createSupabaseServerClient()
  await supabase.from("posts").delete().eq("slug", slug)

  revalidatePath("/admin")
  revalidatePath("/blog")
  redirect("/admin")
}

export type UploadResult = { url?: string; error?: string }

/**
 * Upload one image to the blog-media bucket.
 *
 * Goes through the ADMIN'S SESSION, not the secret key, so the storage
 * policies in 0002_storage.sql are what authorise it. If this ever starts
 * failing with "new row violates row-level security", that migration has not
 * been run — the upload is not supposed to work without it.
 */
export async function uploadMedia(form: FormData): Promise<UploadResult> {
  if (!(await getAdminUser())) return { error: "Your session has expired." }

  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) return { error: "No file received." }
  if (file.size > 10 * 1024 * 1024) return { error: "That image is larger than 10MB." }
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    return { error: "Images only — JPEG, PNG, WebP or AVIF." }
  }

  const supabase = await createSupabaseServerClient()
  // Random prefix: two posts can legitimately both have a "cover.jpg", and the
  // second must not silently replace the first.
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60)
  const key = `posts/${Date.now().toString(36)}-${safe}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error("[uploadMedia]", error.message)
    return { error: error.message }
  }

  return { url: supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl }
}

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient, getAdminUser } from "@/lib/supabase/server"
import type { Block, MediaItem } from "@/lib/blog-types"
import { deriveVideoDuration } from "@/lib/blog-format"
import {
  createUploadTicket,
  type Ticket,
  type FileMeta,
  type UploadKind,
} from "@/lib/uploads"

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

  // A video block with no file renders as a dead player with a play button
  // that does nothing. Catch it before it is published rather than after a
  // visitor finds it. Drafts may be incomplete — that is what a draft is.
  if (input.status === "published") {
    const empty = input.blocks.findIndex(
      (b) => b.kind === "video" && !b.src.trim(),
    )
    if (empty !== -1) {
      return {
        error: `Block ${empty + 1} is a video with no file attached. Upload one, remove the block, or save as a draft.`,
      }
    }
  }

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
    video_duration: deriveVideoDuration(input.blocks, input.videoDuration),
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
  redirect(`/admin/posts/${slug}?saved=${input.originalSlug ? "edited" : "created"}`)
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

/**
 * Re-exported rather than restated. It was restated once, and the copy went
 * stale the moment the ticket grew a signedUrl field — the browser could not
 * see a property the server was already sending.
 */
export type UploadResult = Ticket

/**
 * Issue an upload ticket. The FILE NEVER PASSES THROUGH HERE.
 *
 * It used to: the previous action took the File in FormData and forwarded it
 * to Supabase. That caps out at roughly 4.5MB on Vercel no matter what the
 * code allows, so the 10MB limit it advertised was a limit it could not
 * honour — anything between those two sizes failed in production and worked
 * locally. The browser now sends the bytes straight to storage and this only
 * says whether it may.
 *
 * The ticket is short-lived and single-use, and only a signed-in admin can
 * obtain one, which is what makes it safe for the browser to finish the
 * upload with the publishable key.
 */
export async function requestUpload(
  kind: UploadKind,
  file: FileMeta,
): Promise<UploadResult> {
  if (!(await getAdminUser())) {
    return { ok: false, error: "Your session has expired. Sign in again." }
  }
  const supabase = await createSupabaseServerClient()
  return createUploadTicket(supabase, kind, file)
}

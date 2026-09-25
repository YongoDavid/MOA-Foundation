import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Block, Comment, MediaItem, Post } from "./blog-types"

/**
 * The blog's data access, reading Supabase.
 *
 * Replaces blog-fixtures.ts as the source for every public surface. The
 * fixtures file stays in the repo because scripts/seed-blog.mjs parses it to
 * populate a fresh database — it is now seed data, not a runtime dependency.
 *
 * The row shape and the Post type differ (snake_case columns, and
 * commentCount is derived), so everything goes through toPost rather than
 * being spread straight into a component.
 */

type Row = {
  slug: string
  title: string
  excerpt: string | null
  type: Post["type"]
  category: Post["category"]
  status: Post["status"]
  cover: MediaItem | null
  author: string | null
  published_at: string
  read_time: number | null
  media_count: number | null
  video_duration: string | null
  tags: string[] | null
  featured: boolean
  blocks: Block[] | null
}

const COLUMNS =
  "slug,title,excerpt,type,category,status,cover,author,published_at,read_time,media_count,video_duration,tags,featured,blocks"

function toPost(r: Row, commentCount: number): Post {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    type: r.type,
    category: r.category,
    status: r.status,
    cover: r.cover,
    author: r.author ?? "Comms Team",
    publishedAt: r.published_at,
    readTime: r.read_time ?? 3,
    mediaCount: r.media_count ?? undefined,
    videoDuration: r.video_duration ?? undefined,
    tags: r.tags ?? [],
    featured: r.featured,
    commentCount,
    blocks: r.blocks ?? [],
  }
}

/**
 * Comment totals, counted per post in ONE query rather than per card.
 *
 * The fixtures derived this by filtering an in-memory array. Doing the
 * equivalent against the database naively would be a query per post on the
 * index — eight round trips to render one page.
 */
async function countsBySlug(slugs: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (slugs.length === 0) return counts
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("comments")
    .select("post_slug")
    .in("post_slug", slugs)
  for (const row of data ?? []) {
    counts.set(row.post_slug, (counts.get(row.post_slug) ?? 0) + 1)
  }
  return counts
}

/** Published posts, newest first. Drafts are excluded by RLS, not by this filter. */
export async function getPosts(): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select(COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("[getPosts]", error.message)
    return []
  }
  const rows = (data ?? []) as Row[]
  const counts = await countsBySlug(rows.map((r) => r.slug))
  return rows.map((r) => toPost(r, counts.get(r.slug) ?? 0))
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("posts")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (!data) return undefined
  const counts = await countsBySlug([slug])
  return toPost(data as Row, counts.get(slug) ?? 0)
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.category === category)
}

/** The index hero. Falls back to the newest post if none is flagged. */
export async function getFeatured(): Promise<Post | undefined> {
  const posts = await getPosts()
  return posts.find((p) => p.featured) ?? posts[0]
}

/**
 * Comments for a post, NEWEST FIRST — the thread header says "Newest first"
 * and the optimistic insert prepends, so the stored order has to agree or a
 * refresh reshuffles what the reader just saw.
 *
 * Reads the comments_public VIEW, never the table. The view omits `email`,
 * which is accepted on the form and must never be returned to a browser.
 */
export async function getComments(slug: string): Promise<Comment[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("comments_public")
    .select("id,post_slug,parent_id,name,is_staff,body,created_at,like_count")
    .eq("post_slug", slug)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getComments]", error.message)
    return []
  }
  return (data ?? []).map((c) => ({
    id: c.id,
    postSlug: c.post_slug,
    parentId: c.parent_id,
    name: c.name,
    isStaff: c.is_staff,
    body: c.body,
    createdAt: c.created_at,
    likeCount: c.like_count,
  }))
}

/** Slugs for generateStaticParams / sitemaps. */
export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from("posts").select("slug").eq("status", "published")
  return (data ?? []).map((r) => r.slug)
}

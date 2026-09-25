import { notFound } from "next/navigation"
import PostEditor, { type EditorPost } from "@/components/admin/PostEditor"
import { AdminShell } from "@/components/admin/AdminShell"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata = { robots: { index: false, follow: false } }

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle()
  if (!data) notFound()

  const initial: EditorPost = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? "",
    type: data.type,
    category: data.category,
    status: data.status,
    author: data.author ?? "Comms Team",
    publishedAt: data.published_at,
    readTime: data.read_time ?? 3,
    tags: data.tags ?? [],
    featured: Boolean(data.featured),
    cover: data.cover ?? null,
    blocks: data.blocks ?? [],
    mediaCount: data.media_count ?? null,
    videoDuration: data.video_duration ?? null,
  }

  return (
    <AdminShell heading="Edit post">
      <PostEditor
        initial={initial}
        isNew={false}
        saved={
          sp.saved === "created" || sp.saved === "edited"
            ? (sp.saved as "created" | "edited")
            : undefined
        }
      />
    </AdminShell>
  )
}

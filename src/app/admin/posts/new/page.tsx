import PostEditor, { type EditorPost } from "@/components/admin/PostEditor"
import { AdminShell } from "@/components/admin/AdminShell"

export const metadata = { title: "New post", robots: { index: false, follow: false } }

export default function NewPostPage() {
  const today = new Date().toISOString().slice(0, 10)
  const blank: EditorPost = {
    slug: "",
    title: "",
    excerpt: "",
    type: "story",
    category: "partnerships",
    status: "published",
    author: "Comms Team",
    publishedAt: today,
    readTime: 3,
    tags: [],
    featured: false,
    cover: null,
    blocks: [{ kind: "paragraph", text: "" }],
    mediaCount: null,
    videoDuration: null,
  }
  // Starts PUBLISHED, at the client's request (25 Sep 2026). Draft remains
  // available in the status dropdown for anyone who wants to work on a post
  // before it goes live; it is simply not the default any more.
  return (
    <AdminShell heading="New post">
      <PostEditor initial={blank} isNew />
    </AdminShell>
  )
}

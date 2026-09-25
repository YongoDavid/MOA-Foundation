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
    status: "draft",
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
  // Starts as a DRAFT. A new post should never be one mistaken click from
  // being live, and drafts are invisible to the public by RLS policy.
  return (
    <AdminShell heading="New post">
      <PostEditor initial={blank} isNew />
    </AdminShell>
  )
}

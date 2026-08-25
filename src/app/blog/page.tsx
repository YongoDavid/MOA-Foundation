// Placeholder — replaced by the real index (mockup 1a) in Task 3.
import { getPosts } from "@/lib/blog-fixtures"

export default function BlogIndexPage() {
  const posts = getPosts()
  return (
    <main style={{ padding: "40px" }}>
      <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em" }}>
        Stories &amp; Activities
      </h1>
      <p style={{ color: "var(--blog-ink-500)" }}>
        {posts.length} posts loaded from fixtures.
      </p>
    </main>
  )
}

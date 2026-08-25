// Interim index — Task 3 replaces this with the full mockup 1a layout
// (featured hero + recent list + reflowing grid + pagination).
import { getPosts } from "@/lib/blog-fixtures"
import CategoryChips from "@/components/blog/CategoryChips"
import PostCard from "@/components/blog/PostCard"

export const metadata = {
  title: "Stories & Activities",
  description:
    "Events, outreaches and mentoring sessions from across the continent, written by our team as they happen.",
}

export default function BlogIndexPage() {
  const posts = getPosts()

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div
        className="mb-1 text-[11px] font-extrabold uppercase leading-none tracking-[.14em]"
        style={{ color: "var(--blog-violet-600)" }}
      >
        From the field
      </div>
      <h1 className="mb-2 mt-3 text-[44px] font-extrabold leading-[1.08] tracking-[-.02em]">
        Stories &amp; Activities
      </h1>
      <p
        className="mb-7 max-w-[620px] text-[15px] font-medium leading-[1.6]"
        style={{ color: "var(--blog-ink-500)" }}
      >
        Events, outreaches and mentoring sessions from across the continent,
        written by our team as they happen.
      </p>

      <CategoryChips />

      <div
        className="mt-8 grid gap-[26px]"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            variant={post.type === "story" ? "story" : "media"}
          />
        ))}
      </div>
    </main>
  )
}

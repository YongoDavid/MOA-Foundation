import { getFeatured, getPosts } from "@/lib/blog-fixtures"
import CategoryChips from "@/components/blog/CategoryChips"
import FeaturedPost from "@/components/blog/FeaturedPost"
import PostCard from "@/components/blog/PostCard"
import RecentList from "@/components/blog/RecentList"

export const metadata = {
  title: "Stories & Activities",
  description:
    "Events, outreaches and mentoring sessions from across the continent, written by our team as they happen.",
}

// Mockup 1a. Server component — the index must be crawlable, so nothing here
// fetches on the client.
export default function BlogIndexPage() {
  const posts = getPosts()
  const featured = getFeatured()
  // Featured takes the hero, the next three fill the column beside it, the
  // remainder flow into the grid.
  const rest = posts.filter((p) => p.slug !== featured?.slug)
  const recent = rest.slice(0, 3)
  const grid = rest.slice(3)

  return (
    <main>
      <header
        className="px-10 pb-[30px] pt-10"
        style={{
          background:
            "linear-gradient(180deg, var(--blog-violet-050) 0%, var(--blog-surface) 100%)",
        }}
      >
        <div className="mx-auto max-w-[1180px]">
          <div
            className="text-[11px] font-extrabold uppercase leading-none tracking-[.14em]"
            style={{ color: "var(--blog-violet-600)" }}
          >
            From the field
          </div>
          <h1 className="mb-2 mt-3 text-[28px] font-extrabold leading-[1.1] tracking-[-.02em] md:text-[44px] md:leading-[1.08]">
            Stories &amp; Activities
          </h1>
          <p
            className="m-0 max-w-[620px] text-[15px] font-medium leading-[1.6]"
            style={{ color: "var(--blog-ink-500)" }}
          >
            Events, outreaches and mentoring sessions from across the continent,
            written by our team as they happen.
          </p>
          <div className="mt-[26px]">
            <CategoryChips />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-10 pb-[34px]">
        <div className="grid items-stretch gap-[26px] lg:grid-cols-[1.35fr_1fr]">
          {featured ? <FeaturedPost post={featured} /> : null}
          <RecentList posts={recent} />
        </div>
      </div>

      {grid.length > 0 ? (
        <div className="mx-auto max-w-[1180px] px-10 pb-11">
          <div
            className="grid gap-[26px]"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {grid.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                variant={post.type === "story" ? "story" : "media"}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/*
        No pagination control. The design document defines `showPagination`
        with a default of false, and the fixture set is a single page — a
        rendered "1 2 3 Next" that goes nowhere would mislead in a client demo.
        Add it when there is real paged data behind it.
      */}
    </main>
  )
}

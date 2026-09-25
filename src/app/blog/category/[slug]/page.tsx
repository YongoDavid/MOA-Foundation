import Link from "next/link"
import { notFound } from "next/navigation"
import { CATEGORIES } from "@/lib/blog-types"
import type { Category } from "@/lib/blog-types"
import { getPostsByCategory } from "@/lib/blog-db"
import CategoryChips from "@/components/blog/CategoryChips"
import PostCard from "@/components/blog/PostCard"

type Params = { slug: string }

/**
 * Rendered per request. The blog is database-backed now, and the client's two
 * requirements — an edit in the admin shows on the site straight away, and a
 * comment appears the moment it is posted — are incompatible with serving a
 * cached page. Traffic here is low; correctness is worth the round trip.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const meta = CATEGORIES.find((c) => c.slug === slug)
  if (!meta) return {}
  return {
    title: `${meta.label} — Stories & Activities`,
    description: `Posts from the ${meta.label.toLowerCase()} programme at the Moses Mentoring Foundation.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const meta = CATEGORIES.find((c) => c.slug === slug)
  // Unknown slug is a 404, not an empty list — an empty list would imply the
  // category exists and simply has no posts yet.
  if (!meta) notFound()

  const posts = await getPostsByCategory(slug)

  return (
    <>
      <header className="bg-paper px-5 pb-8 pt-10 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
            From the field
          </p>
          <h1 className="m-0 mt-3.5 font-display text-[40px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[50px]">
            {meta.label}
          </h1>
        </div>
      </header>

      <CategoryChips active={slug as Category} />

      <div className="mx-auto max-w-[1180px] px-5 pb-11 pt-8 lg:px-10">
        {posts.length === 0 ? (
          // Empty state, spec §10.
          <div className="py-16 text-center">
            <p
              className="m-0 text-[15px] font-medium"
              style={{ color: "#5C5460" }}
            >
              No posts in this category yet.
            </p>
            <Link
              href="/blog"
              className="mt-3 inline-block text-[13px] font-bold"
              style={{ color: "#B4762A" }}
            >
              ← All posts
            </Link>
          </div>
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                variant={post.type === "story" ? "story" : "media"}
                // Cards sit directly under this page's h1, so they are h2 here
                // — at h3 the document skips a heading level.
                headingLevel={2}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

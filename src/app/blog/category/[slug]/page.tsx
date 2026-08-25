import Link from "next/link"
import { notFound } from "next/navigation"
import { CATEGORIES } from "@/lib/blog-types"
import type { Category } from "@/lib/blog-types"
import { getPostsByCategory } from "@/lib/blog-fixtures"
import CategoryChips from "@/components/blog/CategoryChips"
import PostCard from "@/components/blog/PostCard"

type Params = { slug: string }

// Four fixed categories, so every category page is known at build time.
export function generateStaticParams(): Params[] {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

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
    description: `Posts from the ${meta.label.toLowerCase()} programme at the Moses of Africa Mentoring Foundation.`,
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

  const posts = getPostsByCategory(slug)

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
            {meta.label}
          </h1>
          <div className="mt-[26px]">
            <CategoryChips active={slug as Category} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-10 pb-11 pt-8">
        {posts.length === 0 ? (
          // Empty state, spec §10.
          <div className="py-16 text-center">
            <p
              className="m-0 text-[15px] font-medium"
              style={{ color: "var(--blog-ink-500)" }}
            >
              No posts in this category yet.
            </p>
            <Link
              href="/blog"
              className="mt-3 inline-block text-[13px] font-bold"
              style={{ color: "var(--blog-violet-600)" }}
            >
              ← All posts
            </Link>
          </div>
        ) : (
          <div
            className="grid gap-[26px]"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                variant={post.type === "story" ? "story" : "media"}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

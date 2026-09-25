import Image from "next/image"
import Link from "next/link"
import { getPosts } from "@/lib/blog-db"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, plural } from "@/lib/blog-format"

// Spec §4 band 07 — three most recent posts on panel ground.
//
// Replaces the old LatestPostsBlock, which rendered in the retired blog
// palette. Reads the same fixtures; only the treatment changes.
export default async function RecentPosts() {
  const posts = (await getPosts()).slice(0, 3)
  if (posts.length === 0) return null

  return (
    <section className="border-t border-ink-900/[.14] bg-panel px-5 py-12 lg:px-14 lg:py-[76px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              07 — From the field
            </p>
            <h2 className="m-0 mt-3.5 font-display text-[32px] font-extrabold uppercase leading-none text-ink-900 lg:text-[42px]">
              Recent posts
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex min-h-[44px] items-center font-body text-[11px] font-bold uppercase leading-none tracking-[.1em] text-umber-600 transition-colors duration-150 hover:text-umber-800"
          >
            All posts →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {posts.map((post) => {
            const category =
              CATEGORIES.find((c) => c.slug === post.category)?.label ??
              post.category
            return (
              <article
                key={post.slug}
                className="border border-ink-900/[.14] bg-paper"
              >
                <div className="relative h-[190px] bg-sand-200">
                  {post.cover ? (
                    <Image
                      src={post.cover.url as string}
                      alt={post.cover.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-[22px]">
                  <p className="m-0 font-body text-[10px] font-bold uppercase leading-none tracking-[.14em] text-umber-600">
                    {category} · {formatDate(post.publishedAt, "short")}
                  </p>
                  <h3 className="m-0 mt-3 font-display text-[20px] font-extrabold uppercase leading-[1.1] text-ink-900 lg:text-[22px]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="m-0 mt-3.5 font-body text-[11.5px] font-semibold leading-none text-ink-400">
                    {plural(post.commentCount, "comment")}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

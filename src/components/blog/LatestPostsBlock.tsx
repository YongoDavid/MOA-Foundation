import Image from "next/image"
import Link from "next/link"
import { getPosts } from "@/lib/blog-fixtures"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, plural } from "@/lib/blog-format"
import BlogScope from "./BlogScope"
import PlayBadge from "./PlayBadge"

// Mockup 1d — the homepage block. Three most recent posts plus a link to the
// blog (acceptance criterion 9).
//
// Self-wrapping in BlogScope: this is the one blog surface that renders
// OUTSIDE /blog, so it cannot inherit the scope from the blog layout.
//
// Note this is where the two palettes meet — mockup violet and Plus Jakarta
// Sans directly between homepage sections using royal-purple and Outfit. That
// is the expected consequence of the 25 Aug decision, and it is reversible by
// editing blog.css alone.

export default function LatestPostsBlock() {
  const posts = getPosts().slice(0, 3)
  if (posts.length === 0) return null

  return (
    <BlogScope>
      <section className="bg-white px-[18px] md:px-10 pb-[60px] pt-14">
        <div className="mx-auto mb-[38px] max-w-[600px] text-center">
          <div
            className="text-[11px] font-extrabold uppercase leading-none tracking-[.14em]"
            style={{ color: "var(--blog-violet-600)" }}
          >
            Latest stories
          </div>
          <h2 className="mb-[10px] mt-3 text-[28px] font-extrabold leading-[1.12] tracking-[-.02em] md:text-[38px]">
            From Our Blog
          </h2>
          <p
            className="m-0 text-[15px] font-medium leading-[1.6]"
            style={{ color: "var(--blog-ink-500)" }}
          >
            Where we have been and what we are learning.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1180px] gap-6 md:grid-cols-3">
          {posts.map((post) => {
            const isVideo = post.type === "video"
            const category =
              CATEGORIES.find((c) => c.slug === post.category)?.label ??
              post.category
            return (
              <article
                key={post.slug}
                className="blog-card overflow-hidden rounded-2xl bg-white"
                style={{ boxShadow: "0 6px 24px rgba(15,22,38,.09)" }}
              >
                <div
                  className="relative h-[180px]"
                  style={{ background: "var(--blog-media-empty)" }}
                >
                  {post.cover ? (
                    <Image
                      src={post.cover.url as string}
                      alt={post.cover.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                  ) : null}
                  {isVideo ? (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3">
                      <PlayBadge size={44} />
                    </div>
                  ) : null}
                </div>

                <div className="p-[22px]">
                  <div
                    className="mb-[10px] text-[10px] font-bold uppercase leading-none tracking-[.1em]"
                    style={{
                      color: isVideo
                        ? "var(--blog-amber-500)"
                        : "var(--blog-violet-600)",
                    }}
                  >
                    {isVideo ? "Video" : category} ·{" "}
                    {formatDate(post.publishedAt, "short")}
                  </div>
                  <h3 className="text-[17px] font-bold leading-[1.32]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <div
                    className="mt-[14px] text-[12px] font-semibold leading-none"
                    style={{ color: "var(--blog-ink-400)" }}
                  >
                    {plural(post.commentCount, "comment")}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-[38px] flex justify-center">
          <Link
            href="/blog"
            className="rounded-full px-[30px] py-[15px] text-[13px] font-bold leading-none tracking-[.03em] text-white"
            style={{ background: "var(--blog-violet-600)" }}
          >
            Visit the blog
          </Link>
        </div>
      </section>
    </BlogScope>
  )
}

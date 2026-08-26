import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, mediaLabel, plural } from "@/lib/blog-format"
import PlayBadge from "./PlayBadge"

// The three-item column beside the featured post, mockup 1a.
// Spec §4: 120x88 thumbnails, hairline divider between items, none after the
// last.

export default function RecentList({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post, i) => {
        const isLast = i === posts.length - 1
        const category =
          CATEGORIES.find((c) => c.slug === post.category)?.label ?? post.category
        // Video posts show "Video · 2:41" in amber instead of the category.
        const isVideo = post.type === "video"
        const eyebrow = isVideo
          ? mediaLabel("video", { duration: post.videoDuration })
          : category

        return (
          <article
            key={post.slug}
            className="blog-card flex gap-4"
            style={
              isLast
                ? undefined
                : {
                    paddingBottom: 16,
                    borderBottom: "1px solid var(--blog-hairline)",
                  }
            }
          >
            <div
              className="relative h-[76px] w-[96px] flex-none overflow-hidden rounded-[11px] md:h-[88px] md:w-[120px] md:rounded-xl"
              style={{ background: "var(--blog-media-empty)" }}
            >
              {post.cover ? (
                <Image
                  src={post.cover.url as string}
                  alt={post.cover.alt}
                  fill
                  sizes="(max-width: 768px) 96px, 120px"
                  className="object-cover"
                />
              ) : null}
              {isVideo ? (
                <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3">
                  <PlayBadge size={30} />
                </div>
              ) : null}
            </div>

            <div>
              <div
                className="mb-[7px] text-[10px] font-bold uppercase leading-none tracking-[.1em]"
                style={{
                  color: isVideo
                    ? "var(--blog-amber-500)"
                    : "var(--blog-violet-600)",
                }}
              >
                {eyebrow}
              </div>
              <h3 className="text-[14px] font-bold leading-[1.35] md:text-[15px]">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <div
                className="mt-2 text-[11.5px] font-semibold leading-none"
                style={{ color: "var(--blog-ink-400)" }}
              >
                {formatDate(post.publishedAt, "long")} ·{" "}
                {plural(post.commentCount, "comment")}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

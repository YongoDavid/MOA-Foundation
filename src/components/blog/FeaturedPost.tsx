import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, mediaLabel } from "@/lib/blog-format"
import MediaBadge from "./MediaBadge"
import PlayBadge from "./PlayBadge"

// The index hero, mockup 1a.
//
// Spec §4: full-bleed image with a scrim running from transparent at 38% to
// rgba(15,22,38,.86) at the bottom. The scrim and the text sit under
// pointer-events:none so the whole card behaves as one link — the title
// carries the anchor and .blog-card::after stretches it.

export default function FeaturedPost({ post }: { post: Post }) {
  const category =
    CATEGORIES.find((c) => c.slug === post.category)?.label ?? post.category
  const badge = mediaLabel(post.type, {
    count: post.mediaCount,
    duration: post.videoDuration,
  })

  return (
    <article
      className="blog-card relative min-h-[320px] overflow-hidden rounded-[18px]"
      style={{ background: "var(--blog-ink-900)" }}
    >
      {post.cover ? (
        <Image
          src={post.cover.url as string}
          alt={post.cover.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      ) : null}

      {/* Scrim — decorative, must not intercept the card's click (spec §11). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,22,38,0) 38%, rgba(15,22,38,.86) 100%)",
        }}
      />

      {post.type === "video" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <PlayBadge size={66} />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-[26px] bottom-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {badge ? (
            <MediaBadge
              kind={post.type}
              count={post.mediaCount}
              duration={post.videoDuration}
            />
          ) : null}
          <span
            className="rounded-md px-[11px] py-[6px] text-[10px] font-bold uppercase leading-none tracking-[.1em] text-white backdrop-blur-[6px]"
            style={{ background: "rgba(255,255,255,.16)" }}
          >
            {category}
          </span>
        </div>

        <h2 className="m-0 mb-[10px] max-w-[520px] text-[27px] font-extrabold leading-[1.2] tracking-[-.015em] text-white">
          {/* pointer-events restored on the anchor itself so it stays focusable */}
          <Link href={`/blog/${post.slug}`} className="pointer-events-auto">
            {post.title}
          </Link>
        </h2>

        <div
          className="text-[12px] font-semibold leading-none"
          style={{ color: "rgba(255,255,255,.72)" }}
        >
          {post.author} · {formatDate(post.publishedAt, "long")} ·{" "}
          {post.readTime} min read
        </div>
      </div>
    </article>
  )
}

import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, initials, mediaLabel } from "@/lib/blog-format"
import PlayBadge from "./PlayBadge"

// Grid card, mockup 1a. Two variants (spec §4):
//   media — image on top, category eyebrow, title, excerpt, author row
//   story — no image, teal tint, larger title, "Read →" footer
//
// Accessibility (spec §11): the title carries the ONLY anchor, stretched over
// the card by the .blog-card::after rule in blog.css. Nesting a second link
// inside a card is what that pattern exists to avoid.

function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}

export default function PostCard({
  post,
  variant = "media",
}: {
  post: Post
  variant?: "media" | "story"
}) {
  const href = `/blog/${post.slug}`
  const suffix = mediaLabel(post.type, {
    count: post.mediaCount,
    duration: post.videoDuration,
  })

  if (variant === "story") {
    return (
      <article
        className="blog-card flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: "var(--blog-teal-tint)",
          border: "1px solid var(--blog-border)",
          boxShadow: "0 2px 14px rgba(15,22,38,.05)",
        }}
      >
        <div className="px-5 pt-5">
          <div
            className="mb-3 text-[10px] font-bold uppercase leading-none tracking-[.1em]"
            style={{ color: "var(--blog-teal-500)" }}
          >
            Story · No photos
          </div>
          <h3 className="text-[19px] font-extrabold leading-[1.28] tracking-[-.01em]">
            <Link href={href}>{post.title}</Link>
          </h3>
          <p
            className="mt-3 text-[13px] font-medium leading-[1.62]"
            style={{ color: "#41566B" }}
          >
            {post.excerpt}
          </p>
        </div>
        <div
          className="mt-auto flex items-center justify-between p-5 text-[11.5px] font-semibold leading-none"
          style={{ color: "var(--blog-ink-500)" }}
        >
          <span>
            {post.author} · {formatDate(post.publishedAt, "medium")}
          </span>
          <span style={{ color: "var(--blog-teal-500)" }}>Read →</span>
        </div>
      </article>
    )
  }

  return (
    <article
      className="blog-card overflow-hidden rounded-2xl"
      style={{
        background: "var(--blog-surface)",
        border: "1px solid var(--blog-border)",
        boxShadow: "0 2px 14px rgba(15,22,38,.05)",
      }}
    >
      <div
        className="relative h-[170px]"
        style={{ background: "var(--blog-media-empty)" }}
      >
        {post.cover ? (
          <Image
            src={post.cover.url as string}
            alt={post.cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : null}
        {post.type === "video" ? (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3">
            <PlayBadge size={44} />
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="mb-[10px] flex gap-2 text-[10px] font-bold uppercase leading-none tracking-[.1em]">
          <span
            style={{
              color:
                post.type === "video"
                  ? "var(--blog-amber-500)"
                  : "var(--blog-violet-600)",
            }}
          >
            {categoryLabel(post.category)}
          </span>
          {suffix ? (
            <span style={{ color: "var(--blog-ink-400)" }}>{suffix}</span>
          ) : null}
        </div>

        <h3 className="text-[16.5px] font-bold leading-[1.32]">
          <Link href={href}>{post.title}</Link>
        </h3>

        <p
          className="mt-[10px] text-[13px] font-medium leading-[1.6]"
          style={{ color: "var(--blog-ink-500)" }}
        >
          {post.excerpt}
        </p>

        <div
          className="mt-4 flex items-center gap-[9px] text-[11.5px] font-semibold leading-none"
          style={{ color: "var(--blog-ink-400)" }}
        >
          <span
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[9px] font-bold leading-none"
            style={{ background: "var(--blog-media-empty)", color: "#7A6E96" }}
          >
            {initials(post.author)}
          </span>
          <span>{post.author}</span>
          <span>·</span>
          <span>{formatDate(post.publishedAt, "medium")}</span>
        </div>
      </div>
    </article>
  )
}

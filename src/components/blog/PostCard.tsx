import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, initials, mediaLabel } from "@/lib/blog-format"
import PlayBadge from "./PlayBadge"

// Grid card, mockup 1a. Two variants (spec §4):
//   media — image on top, category eyebrow, title, excerpt, author row
//   story — no image, green ground, larger title, "Read →" footer
//
// Accessibility (spec §11): the title carries the ONLY anchor, stretched over
// the card by the .card-stretch::after rule in globals.css. Nesting a second link
// inside a card is what that pattern exists to avoid.

function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}

export default function PostCard({
  post,
  variant = "media",
  headingLevel = 3,
}: {
  post: Post
  variant?: "media" | "story"
  /**
   * The card title's heading level. 3 on the blog index, where the featured
   * post already owns the h2. 2 on the category pages, where the cards sit
   * directly under the page h1 — leaving them at h3 skips a level, and
   * heading-level navigation is how screen-reader users scan a list.
   */
  headingLevel?: 2 | 3
}) {
  const Heading = (`h${headingLevel}` as const) satisfies "h2" | "h3"
  const href = `/blog/${post.slug}`
  const suffix = mediaLabel(post.type, {
    count: post.mediaCount,
    duration: post.videoDuration,
  })

  if (variant === "story") {
    // The story card is the one card with no photograph, so it carries the
    // green ground instead — the reskin uses colour where the others use an
    // image, rather than leaving a conspicuously empty tile in the grid.
    return (
      <article className="card-stretch flex flex-col bg-green-900">
        <div className="px-[22px] pt-[22px]">
          <p className="m-0 mb-3.5 font-body text-[10px] font-bold uppercase leading-none tracking-[.14em] text-gold-500">
            Story · No photographs
          </p>
          <Heading className="m-0 font-display text-[28px] font-extrabold uppercase leading-[1.02] text-white">
            <Link href={href}>{post.title}</Link>
          </Heading>
          <p className="m-0 mt-3.5 font-body text-[13px] font-medium leading-[1.62] text-white/[.76]">
            {post.excerpt}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between p-[22px] font-body text-[11px] font-semibold uppercase leading-none tracking-[.06em] text-white/60">
          <span>
            {post.author} · {formatDate(post.publishedAt, "medium")}
          </span>
          <span className="text-gold-500">Read →</span>
        </div>
      </article>
    )
  }

  return (
    <article
      className="card-stretch overflow-hidden"
      style={{
        background: "#FBF8F3",
        border: "1px solid rgba(20,16,24,.16)",
      }}
    >
      <div
        className="relative h-[170px]"
        style={{ background: "#E2DBCC" }}
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
                  ? "#C99A45"
                  : "#B4762A",
            }}
          >
            {categoryLabel(post.category)}
          </span>
          {suffix ? (
            <span style={{ color: "#857C86" }}>{suffix}</span>
          ) : null}
        </div>

        <Heading className="font-display uppercase text-[24px] font-extrabold leading-[1.05]">
            <Link href={href}>{post.title}</Link>
          </Heading>

        <p
          className="mt-[10px] text-[13px] font-medium leading-[1.6]"
          style={{ color: "#5C5460" }}
        >
          {post.excerpt}
        </p>

        <div
          className="mt-4 flex items-center gap-[9px] text-[11.5px] font-semibold leading-none"
          style={{ color: "#857C86" }}
        >
          <span
            className="flex h-6 w-6 flex-none items-center justify-center text-[9px] font-bold leading-none"
            style={{ background: "#E2DBCC", color: "#7A6F5E" }}
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

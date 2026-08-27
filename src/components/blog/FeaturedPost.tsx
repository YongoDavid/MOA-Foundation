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
// rgba(20,16,24,.86) at the bottom. The scrim and the text sit under
// pointer-events:none so the whole card behaves as one link — the title
// carries the anchor and .card-stretch::after stretches it.

export default function FeaturedPost({ post }: { post: Post }) {
  const category =
    CATEGORIES.find((c) => c.slug === post.category)?.label ?? post.category
  const badge = mediaLabel(post.type, {
    count: post.mediaCount,
    duration: post.videoDuration,
  })

  return (
    // Mockup 1e: below md the hero restructures rather than merely shrinking —
    // a 190px image with the title BENEATH it in ink, instead of white text
    // overlaid on a scrim. One DOM structure, repositioned by breakpoint, so
    // there is no duplicated heading for screen readers to read twice.
    <article className="card-stretch md:relative md:min-h-[320px] md:overflow-hidden md:">
      <div
        className="relative h-[190px] overflow-hidden md:absolute md:inset-0 md:h-auto md:"
        style={{ background: "#141018" }}
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

        {/* Scrim is only meaningful behind overlaid text, so desktop only. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,24,0) 38%, rgba(20,16,24,.86) 100%)",
          }}
        />

        {/* On mobile the badge sits on the image; on desktop it joins the
            overlaid text block below. */}
        {badge ? (
          <div className="absolute left-3 top-3 md:hidden">
            <MediaBadge
              kind={post.type}
              count={post.mediaCount}
              duration={post.videoDuration}
            />
          </div>
        ) : null}

        {post.type === "video" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <PlayBadge size={66} />
          </div>
        ) : null}
      </div>

      <div className="mt-[13px] md:pointer-events-none md:absolute md:inset-x-[26px] md:bottom-6 md:mt-0">
        <div className="mb-3 hidden flex-wrap gap-2 md:flex">
          {badge ? (
            <MediaBadge
              kind={post.type}
              count={post.mediaCount}
              duration={post.videoDuration}
            />
          ) : null}
          <span
            className="px-[11px] py-[6px] text-[10px] font-bold uppercase leading-none tracking-[.1em] text-white backdrop-blur-[6px]"
            style={{ background: "rgba(255,255,255,.16)" }}
          >
            {category}
          </span>
        </div>

        <h2 className="font-display uppercase m-0 mb-[9px] max-w-[520px] text-[24px] font-extrabold leading-[1.04] md:mb-3 md:text-[34px] md:leading-[1.02] md:md:text-white">
          <Link href={`/blog/${post.slug}`} className="md:pointer-events-auto">
            {post.title}
          </Link>
        </h2>

        <div
          className="text-[11.5px] font-semibold leading-none md:text-[12px] md:!text-white/70"
          style={{ color: "#857C86" }}
        >
          {post.author} · {formatDate(post.publishedAt, "long")} ·{" "}
          {post.readTime} min read
        </div>
      </div>
    </article>
  )
}

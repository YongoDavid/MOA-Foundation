import Link from "next/link"
import type { Post } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { formatDate, initials, plural } from "@/lib/blog-format"
import MediaBadge from "./MediaBadge"

// Post header, mockup 1b: breadcrumb, chips, title, author row with
// Share / Copy link.
//
// Share and Copy link are presentational in the prototype — wiring the Web
// Share API and clipboard is trivial but needs a client boundary, and this
// header is otherwise a server component. Plan 3.

export default function PostHeader({ post }: { post: Post }) {
  const category =
    CATEGORIES.find((c) => c.slug === post.category)?.label ?? post.category

  return (
    <header className="mx-auto max-w-[1180px] px-10">
      <nav
        aria-label="Breadcrumb"
        className="pt-[30px] text-[12px] font-semibold leading-none"
        style={{ color: "var(--blog-ink-400)" }}
      >
        <Link href="/blog" style={{ color: "var(--blog-violet-600)" }}>
          Blog
        </Link>
        <span className="px-2">/</span>
        <Link href={`/blog/category/${post.category}`}>{category}</Link>
      </nav>

      <div className="max-w-[800px] pt-[22px]">
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className="rounded-md px-[11px] py-[6px] text-[10px] font-bold uppercase leading-none tracking-[.1em]"
            style={{
              background: "var(--blog-violet-050)",
              color: "var(--blog-violet-600)",
            }}
          >
            {category}
          </span>
          <MediaBadge
            kind={post.type}
            count={post.mediaCount}
            duration={post.videoDuration}
            variant="tint"
          />
        </div>

        <h1 className="m-0 text-[25px] font-extrabold leading-[1.16] tracking-[-.02em] md:text-[40px] md:leading-[1.14] md:tracking-[-.022em]">
          {post.title}
        </h1>

        <div
          className="mt-[22px] flex flex-wrap items-center gap-3 pb-6"
          style={{ borderBottom: "1px solid var(--blog-hairline)" }}
        >
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-[14px] font-bold leading-none"
            style={{ background: "var(--blog-media-empty)", color: "#7A6E96" }}
          >
            {initials(post.author)}
          </span>
          <div>
            <div className="text-[13.5px] font-bold leading-[1.3]">
              {post.author}
            </div>
            <div
              className="text-[12px] font-semibold leading-[1.3]"
              style={{ color: "var(--blog-ink-400)" }}
            >
              {formatDate(post.publishedAt, "long")} · {post.readTime} min read
              {" · "}
              {plural(post.commentCount, "comment")}
            </div>
          </div>

          <div
            className="ml-auto flex gap-2 text-[11.5px] font-bold leading-none"
            style={{ color: "var(--blog-ink-500)" }}
          >
            <span
              className="rounded-lg px-[15px] py-[10px]"
              style={{ border: "1px solid var(--blog-input)" }}
            >
              Share
            </span>
            <span
              className="rounded-lg px-[15px] py-[10px]"
              style={{ border: "1px solid var(--blog-input)" }}
            >
              Copy link
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

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
    <header className="mx-auto max-w-[1180px] px-[18px] md:px-10">
      <nav
        aria-label="Breadcrumb"
        className="pt-[30px] text-[12px] font-semibold leading-none"
        style={{ color: "#857C86" }}
      >
        <Link href="/blog" style={{ color: "#B4762A" }}>
          Blog
        </Link>
        <span className="px-2">/</span>
        <Link href={`/blog/category/${post.category}`}>{category}</Link>
      </nav>

      <div className="max-w-[800px] pt-[22px]">
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className="px-[11px] py-[6px] text-[10px] font-bold uppercase leading-none tracking-[.1em]"
            style={{
              background: "#F3EEE4",
              color: "#B4762A",
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

        <h1 className="font-display uppercase m-0 text-[34px] font-extrabold leading-[1.0] md:text-[52px] md:leading-[.96] md:">
          {post.title}
        </h1>

        <div
          className="mt-[22px] flex flex-wrap items-center gap-3 pb-6"
          style={{ borderBottom: "1px solid rgba(20,16,24,.14)" }}
        >
          <span
            className="flex h-11 w-11 flex-none items-center justify-center text-[14px] font-bold leading-none"
            style={{ background: "#E2DBCC", color: "#7A6F5E" }}
          >
            {initials(post.author)}
          </span>
          <div>
            <div className="text-[13.5px] font-bold leading-[1.3]">
              {post.author}
            </div>
            <div
              className="text-[12px] font-semibold leading-[1.3]"
              style={{ color: "#857C86" }}
            >
              {formatDate(post.publishedAt, "long")} · {post.readTime} min read
              {" · "}
              {plural(post.commentCount, "comment")}
            </div>
          </div>

          <div
            className="ml-auto flex gap-2 text-[11.5px] font-bold leading-none"
            style={{ color: "#5C5460" }}
          >
            <span
              className="px-[15px] py-[10px]"
              style={{ border: "1px solid rgba(20,16,24,.18)" }}
            >
              Share
            </span>
            <span
              className="px-[15px] py-[10px]"
              style={{ border: "1px solid rgba(20,16,24,.18)" }}
            >
              Copy link
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

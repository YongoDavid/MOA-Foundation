import Link from "next/link"
import { CATEGORIES } from "@/lib/blog-types"
import type { Category } from "@/lib/blog-types"

// Category filter, mockup 1a.
//
// Spec §4 is explicit that this is a LINK LIST, not client state: each
// category is a real URL, so filtering is server-rendered, shareable and
// crawlable. Do not convert this to useState + client filtering.
//
// Horizontally scrollable on mobile via .blog-scroll-x — Tailwind's
// `scrollbar-hide` is a no-op in this project (the plugin is not installed),
// so the hiding is hand-written in blog.css.

export default function CategoryChips({
  active,
}: {
  /** Category slug, or undefined on the unfiltered index. */
  active?: Category
}) {
  const chip = "flex-none rounded-full px-[18px] py-[10px] text-[12.5px] font-semibold leading-none whitespace-nowrap"

  return (
    <nav aria-label="Filter posts by category">
      <ul className="blog-scroll-x flex list-none gap-[10px] p-0">
        <li>
          <Link
            href="/blog"
            aria-current={active ? undefined : "page"}
            className={chip}
            style={
              active
                ? {
                    background: "var(--blog-surface)",
                    border: "1px solid var(--blog-border)",
                    color: "var(--blog-ink-500)",
                    display: "inline-block",
                  }
                : {
                    background: "var(--blog-violet-600)",
                    color: "#fff",
                    display: "inline-block",
                  }
            }
          >
            All posts
          </Link>
        </li>
        {CATEGORIES.map((c) => {
          const isActive = c.slug === active
          return (
            <li key={c.slug}>
              <Link
                href={`/blog/category/${c.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={chip}
                style={
                  isActive
                    ? {
                        background: "var(--blog-violet-600)",
                        color: "#fff",
                        display: "inline-block",
                      }
                    : {
                        background: "var(--blog-surface)",
                        border: "1px solid var(--blog-border)",
                        color: "var(--blog-ink-500)",
                        display: "inline-block",
                      }
                }
              >
                {c.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

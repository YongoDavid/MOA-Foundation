import Link from "next/link"
import { CATEGORIES } from "@/lib/blog-types"
import type { Category } from "@/lib/blog-types"

// Category filter, blog-reskin mockup.
//
// Re-drawn from pills to an underlined tab bar so it matches the /gallery
// filter exactly — same panel ground, same 2px ink underline on the current
// item. Two filter bars on one site that behave identically but look unrelated
// is the kind of thing that reads as two different products.
//
// Spec §4 is explicit that this is a LINK LIST, not client state: each
// category is a real URL, so filtering is server-rendered, shareable and
// crawlable. Do not convert this to useState + client filtering.

export default function CategoryChips({
  active,
}: {
  /** Category slug, or undefined on the unfiltered index. */
  active?: Category
}) {
  const items = [
    { href: "/blog", label: "All posts", current: !active },
    ...CATEGORIES.map((c) => ({
      href: `/blog/category/${c.slug}`,
      label: c.label,
      current: c.slug === active,
    })),
  ]

  return (
    <nav
      aria-label="Filter posts by category"
      className="border-b border-ink-900/[.14] bg-panel px-5 lg:px-10"
    >
      <ul className="mx-auto flex max-w-[1180px] list-none snap-x snap-mandatory gap-0 overflow-x-auto p-0">
        {items.map((item, i) => (
          <li key={item.href} className="shrink-0 snap-start">
            <Link
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={`flex min-h-[48px] items-center whitespace-nowrap border-b-2 px-5 pb-[15px] pt-[17px] font-body text-[11px] font-bold uppercase leading-none tracking-[.1em] transition-colors duration-150 lg:min-h-[44px] ${
                i === 0 ? "pl-0" : ""
              } ${
                item.current
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-400 hover:text-ink-700"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

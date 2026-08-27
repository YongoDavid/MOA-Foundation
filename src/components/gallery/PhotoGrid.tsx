import Image from "next/image"
import Link from "next/link"
import { GALLERY_CATEGORIES, PHOTOS, type GalleryCategory } from "@/lib/gallery"
import { SCRIM } from "@/lib/tokens"

/**
 * Gallery grid with category filtering (spec §9).
 *
 * State lives in the URL, not in useState, and this is a SERVER component.
 * Three reasons, in order of how much they matter here:
 *
 * 1. It works with JavaScript off, like every other section of this site. The
 *    smoke script only ever sees server-rendered HTML, so a client-filtered
 *    grid would be a page nothing could verify.
 * 2. /gallery?category=Summits is shareable, and the nav can link straight to
 *    a category later without touching this component.
 * 3. Next.js prefetches and swaps these on the client anyway, so it still
 *    feels like filtering rather than a page load.
 *
 * "Load more" reveals the rest of a set that is already in the bundle. It
 * exists so the first screen is not nineteen full-bleed photographs on a
 * Nigerian mobile connection.
 */
const PAGE = 12

type Filter = "All" | GalleryCategory

export function parseFilter(value: string | string[] | undefined): Filter {
  const found = GALLERY_CATEGORIES.find((c) => c === value)
  return found ?? "All"
}

export function parseShown(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value)
  // Anything absent, negative, fractional or NaN falls back to one page —
  // ?show=-1 must not render an empty grid, and ?show=1e9 must not matter.
  return Number.isInteger(n) && n > 0 ? Math.min(n, PHOTOS.length) : PAGE
}

function href(filter: Filter, shown: number) {
  const p = new URLSearchParams()
  if (filter !== "All") p.set("category", filter)
  if (shown !== PAGE) p.set("show", String(shown))
  const q = p.toString()
  return q ? `/gallery?${q}` : "/gallery"
}

export default function PhotoGrid({
  filter,
  shown,
}: {
  filter: Filter
  shown: number
}) {
  const filtered =
    filter === "All" ? PHOTOS : PHOTOS.filter((p) => p.category === filter)
  const visible = filtered.slice(0, shown)
  const remaining = filtered.length - visible.length

  return (
    <>
      <div className="border-y border-ink-900/[.14] bg-panel px-5 lg:px-14">
        <nav
          aria-label="Filter photographs by category"
          className="mx-auto max-w-[1440px]"
        >
          <ul className="m-0 flex list-none snap-x snap-mandatory gap-0 overflow-x-auto p-0">
            {(["All", ...GALLERY_CATEGORIES] as Filter[]).map((c, i) => {
              const current = c === filter
              return (
                <li key={c} className="shrink-0 snap-start">
                  <Link
                    // Changing filter always resets to page one. Carrying the
                    // count across means switching to a small category and
                    // back to All silently hides photographs.
                    href={href(c, PAGE)}
                    aria-current={current ? "true" : undefined}
                    className={`flex min-h-[48px] items-center whitespace-nowrap border-b-2 px-[22px] pb-[18px] pt-5 font-body text-[11px] font-bold uppercase leading-none tracking-[.1em] transition-colors duration-150 lg:min-h-[44px] ${
                      i === 0 ? "pl-0" : ""
                    } ${
                      current
                        ? "border-ink-900 text-ink-900"
                        : "border-transparent text-ink-400 hover:text-ink-700"
                    }`}
                  >
                    {c}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <div className="bg-paper px-5 pb-14 pt-8 lg:px-14 lg:pb-[76px] lg:pt-[34px]">
        <div className="mx-auto max-w-[1440px]">
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 [grid-auto-flow:dense] [grid-auto-rows:150px] lg:grid-cols-4 lg:[grid-auto-rows:210px]">
            {visible.map((p, i) => (
              <li
                key={p.alt}
                className={`relative overflow-hidden bg-green-950 ${
                  p.span === "feature"
                    ? "col-span-2 row-span-2"
                    : p.span === "wide"
                      ? "col-span-2"
                      : ""
                }`}
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  // Two columns on mobile, four on desktop; feature and wide
                  // tiles take two of those, hence the doubled widths.
                  sizes={
                    p.span
                      ? "(max-width: 1024px) 100vw, 50vw"
                      : "(max-width: 1024px) 50vw, 25vw"
                  }
                  // Only the first row is above the fold; the rest stay lazy.
                  priority={i < 2}
                  className="object-cover"
                />
                {p.caption ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 p-4 lg:p-5"
                    style={{ background: SCRIM.badge }}
                  >
                    <p className="m-0 font-body text-[9.5px] font-bold uppercase leading-none tracking-[.14em] text-gold-500">
                      {p.category}
                    </p>
                    <p
                      className={`m-0 mt-1.5 font-display font-extrabold uppercase leading-[1.05] text-white ${
                        p.span === "feature"
                          ? "text-[20px] lg:text-[26px]"
                          : "text-[16px] lg:text-[20px]"
                      }`}
                    >
                      {p.caption}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            {remaining > 0 ? (
              <Link
                href={href(filter, shown + PAGE)}
                scroll={false}
                className="flex min-h-[48px] items-center border border-ink-900/20 px-[30px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:border-ink-900 hover:bg-ink-900 hover:text-white lg:min-h-[44px]"
              >
                Load more photographs
              </Link>
            ) : null}
            <p className="m-0 font-body text-[12.5px] font-medium leading-none text-ink-400">
              Showing {visible.length} of {filtered.length} photograph
              {filtered.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

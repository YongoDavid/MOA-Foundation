import Link from "next/link"
import { ALIGNMENT } from "@/lib/content"

// Spec §4 band 03 — `300px 1fr`. Two-column bordered list, five bodies each
// with a right-aligned role note; the sixth cell carries the brief link.
//
// Named as text, not logos: written permission for the marks was never
// confirmed, and the copy says so plainly rather than implying endorsement.
//
// The index colour is the one value here outside the nineteen-token palette —
// the mockup's muted taupe for the ordinal. Kept local, not promoted.
const INDEX_MUTED = "#A79A8A"

export default function Alignment({
  eyebrow,
  heading,
}: {
  /** About supplies a heading block; the homepage relies on its section header. */
  eyebrow?: string
  heading?: string
} = {}) {
  return (
    <section className="bg-paper px-5 py-12 lg:px-14 lg:py-[70px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-16">
        <div>
          {eyebrow ? (
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="m-0 mb-[18px] mt-4 font-display text-[30px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[40px]">
              {heading}
            </h2>
          ) : null}
          <p className="m-0 font-body text-[13.5px] font-medium leading-[1.65] text-ink-600">
            Our programme design and reporting follow the frameworks of the
            bodies below. Logos are used only with written permission, so we
            name them plainly.
          </p>
        </div>

        <ul className="m-0 grid list-none grid-cols-1 border-t border-ink-900/[.16] p-0 sm:grid-cols-2">
          {ALIGNMENT.map((body, i) => {
            const leftColumn = i % 2 === 0
            return (
              <li
                key={body.name}
                className={`flex items-baseline gap-3.5 border-b border-ink-900/[.16] py-5 ${
                  leftColumn
                    ? "pr-0 sm:border-r sm:border-ink-900/[.16] sm:pr-6"
                    : "sm:pl-6"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="font-body text-[10.5px] font-semibold leading-none"
                  style={{ color: INDEX_MUTED }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[20px] font-extrabold uppercase leading-[1.1] tracking-[.02em] text-ink-900 lg:text-[25px]">
                  {body.name}
                </span>
                <span className="ml-auto shrink-0 font-body text-[11px] font-medium leading-none text-ink-400">
                  {body.role}
                </span>
              </li>
            )
          })}
          <li className="flex items-center py-5 sm:pl-6">
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center font-body text-[11px] font-bold uppercase leading-none tracking-[.1em] text-umber-600 transition-colors duration-150 hover:text-umber-800"
            >
              Request our partnership brief →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

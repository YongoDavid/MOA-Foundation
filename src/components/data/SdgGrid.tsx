import Link from "next/link"
import { GOALS } from "@/lib/sdg"
import { EVIDENCE } from "@/lib/tokens"

// SDG alignment grid (spec §6).
//
// ALL SEVENTEEN GOALS ALWAYS RENDER. Showing only the seven we address would
// hide the denominator, and the denominator is the entire point of the graphic
// — "seven of seventeen" is a claim about scope, not a list of achievements.
//
// The two muted values below are the one place this file departs from the
// nineteen-token palette. The mockup uses them for the numerals and labels on
// out-of-scope tiles, and no existing token reads correctly on sand-300:
// ink-400 is too purple, sand-400 too pale. Kept local rather than promoted to
// global tokens, so the palette stays at nineteen.
const MUTED_NUMERAL = "#B0A48F"
const MUTED_LABEL = "#9C9080"

export default function SdgGrid() {
  const addressed = new Set<number>(EVIDENCE.sdgAddressed)

  return (
    <ul
      className="m-0 grid list-none grid-cols-4 gap-1.5 p-0 lg:grid-cols-6 lg:gap-2"
      aria-label={`United Nations Sustainable Development Goals — ${addressed.size} of ${GOALS.length} addressed`}
    >
      {GOALS.map((g) => {
        const on = addressed.has(g.n)
        return (
          <li
            key={g.n}
            title={`Goal ${g.n}: ${g.title} — ${on ? "addressed" : "out of scope"}`}
            className={`flex aspect-square flex-col justify-between p-2 lg:p-3 ${
              on ? "bg-green-900" : "bg-sand-300"
            }`}
          >
            <span
              aria-hidden="true"
              className="font-display text-[18px] font-black leading-none lg:text-[26px]"
              style={{ color: on ? undefined : MUTED_NUMERAL }}
            >
              <span className={on ? "text-gold-500" : ""}>
                {String(g.n).padStart(2, "0")}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-body text-[7.5px] font-bold uppercase leading-[1.3] lg:text-[9.5px]"
              style={{ color: on ? "#fff" : MUTED_LABEL }}
            >
              {g.label}
            </span>
            {/* Abbreviating must not lose meaning: the full official title and
                the addressed state are announced, not the shortened label. */}
            <span className="sr-only">
              Goal {g.n}: {g.title}. {on ? "Addressed." : "Out of scope."}
            </span>
          </li>
        )
      })}

      <li className="flex aspect-square items-end border border-ink-900/20 p-2 lg:p-3">
        <Link
          href="/about"
          className="font-body text-[8.5px] font-bold uppercase leading-[1.4] tracking-[.08em] text-umber-600 lg:text-[10px]"
        >
          See the
          <br />
          full report →
        </Link>
      </li>
    </ul>
  )
}

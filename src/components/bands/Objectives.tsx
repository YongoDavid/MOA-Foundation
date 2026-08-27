import { OBJECTIVES } from "@/lib/content"

// Spec §4 band 05 — two-column numbered list on panel ground.
//
// These are REAL, already-published objectives, not placeholders. The spec's
// stop-block warns they read "Objective one — paste verbatim text" and says to
// ship the band switched off; that note predates the v3 mockup, whose ten were
// verified word-for-word against the previous site. Client confirmed 27 Aug
// that the band ships visible.
//
// CSS grid fills row-wise, so a naive 1..10 order would read 01,02 / 03,04
// across the two columns. The mockup wants 01–05 down the left and 06–10 down
// the right, which means interleaving the source order.
export default function Objectives() {
  const half = Math.ceil(OBJECTIVES.length / 2)
  const interleaved = Array.from({ length: half }, (_, i) => [
    { n: i + 1, text: OBJECTIVES[i] },
    OBJECTIVES[i + half]
      ? { n: i + half + 1, text: OBJECTIVES[i + half] }
      : null,
  ]).flat()

  return (
    <section className="bg-panel px-5 py-12 lg:px-14 lg:py-16">
      <ol className="mx-auto m-0 grid max-w-[1440px] list-none grid-cols-1 p-0 lg:grid-cols-2 lg:gap-x-16">
        {interleaved.map((item, i) =>
          item ? (
            <li
              key={item.n}
              className={`flex gap-[18px] border-t border-ink-900/[.16] py-[15px] ${
                i >= interleaved.length - 2 ? "lg:border-b" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-display text-[13px] font-extrabold leading-[1.5] text-umber-600"
              >
                {String(item.n).padStart(2, "0")}
              </span>
              <span className="font-body text-[14px] font-medium leading-[1.55] text-ink-700">
                {item.text}
              </span>
            </li>
          ) : null,
        )}
      </ol>
    </section>
  )
}

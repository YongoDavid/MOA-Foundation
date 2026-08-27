import Link from "next/link"

// Three-card action row, shared by /donate ("Other ways to help") and
// /contact. The third card sits on green-900 with a gold action — in both
// mockups that slot is the institutional/partnership ask, which is addressed
// to organisations rather than individuals. The colour carries that
// distinction, so keep the institutional card third rather than reordering.
export type ActionCard = {
  title: string
  body: string
  action: { label: string; href: string }
  dark?: boolean
}

export default function ActionCards({
  eyebrow,
  heading,
  cards,
  ground = "paper",
  bordered = false,
}: {
  eyebrow?: string
  /** When set, the row sits beside a heading column instead of filling the width. */
  heading?: string
  cards: ActionCard[]
  ground?: "paper" | "panel"
  bordered?: boolean
}) {
  // Column count follows the card count, so removing a card closes the row
  // rather than leaving a hole where it used to be. /donate dropped to two
  // when "Fundraise for us" came out; /contact still has three.
  //
  // Complete literal strings, never `lg:grid-cols-${n}` — Tailwind's scanner
  // cannot see a class name assembled at runtime and would not emit it.
  const cols =
    cards.length === 1
      ? "lg:grid-cols-1"
      : cards.length === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-3"

  const grid = (
    <div className={`grid gap-5 ${cols}`}>
      {cards.map((c) => (
        <article
          key={c.title}
          className={`flex flex-col p-7 ${
            c.dark ? "bg-green-900" : "border border-ink-900/[.16] bg-paper"
          }`}
        >
          <h3
            className={`m-0 font-display text-[24px] font-extrabold uppercase leading-[1.05] lg:text-[26px] ${
              c.dark ? "text-white" : "text-ink-900"
            }`}
          >
            {c.title}
          </h3>
          <p
            className={`m-0 mt-3 font-body text-[13.5px] font-medium leading-[1.6] ${
              c.dark ? "text-white/[.78]" : "text-ink-500"
            }`}
          >
            {c.body}
          </p>
          <div className="mt-auto pt-[18px]">
            <Link
              href={c.action.href}
              className={`inline-flex min-h-[44px] items-center gap-2 font-body text-[11px] font-bold uppercase leading-none tracking-[.09em] underline-offset-4 hover:underline ${
                c.dark ? "text-gold-500" : "text-umber-600"
              }`}
            >
              {c.action.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  )

  return (
    <section
      className={`px-5 py-12 lg:px-14 lg:py-[70px] ${
        ground === "panel" ? "bg-panel" : "bg-paper"
      } ${bordered ? "border-t border-ink-900/[.14]" : ""}`}
    >
      <div className="mx-auto max-w-[1440px]">
        {heading ? (
          <div className="grid items-start gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
            <div>
              {eyebrow ? (
                <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
                  {eyebrow}
                </p>
              ) : null}
              <h2 className="m-0 mt-4 font-display text-[32px] whitespace-pre-line font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[40px]">
                {heading}
              </h2>
            </div>
            {grid}
          </div>
        ) : (
          grid
        )}
      </div>
    </section>
  )
}

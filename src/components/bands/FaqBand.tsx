import { SITE } from "@/lib/site"

// Shared questions band — Apply has four, Become a Mentor has three.
export default function FaqBand({
  eyebrow = "Questions",
  heading,
  intro,
  items,
}: {
  eyebrow?: string
  /** Two lines; \n is the break. */
  heading: string
  intro?: boolean
  items: { q: string; a: string }[]
}) {
  return (
    <section className="border-t border-ink-900/[.14] bg-panel px-5 py-12 lg:px-14 lg:py-[70px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[340px_1fr] lg:gap-16">
        <div>
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
            {eyebrow}
          </p>
          <h2 className="m-0 mt-4 font-display text-[30px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[40px]">
            {heading.split("\n").map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          {intro ? (
            <p className="m-0 mt-[18px] font-body text-[13.5px] font-medium leading-[1.65] text-ink-600">
              Anything else, write to{" "}
              <a href={`mailto:${SITE.email}`} className="text-umber-600">
                {SITE.email}
              </a>{" "}
              — the team answers directly.
            </p>
          ) : null}
        </div>

        <dl className="m-0 flex flex-col">
          {items.map((item, i) => (
            <div
              key={item.q}
              className={`border-t border-ink-900/[.16] py-5 ${
                i === items.length - 1 ? "border-b" : ""
              }`}
            >
              <dt className="font-body text-[15.5px] font-bold leading-[1.4] text-ink-900">
                {item.q}
              </dt>
              <dd className="m-0 mt-2 max-w-[720px] font-body text-[13.5px] font-medium leading-[1.65] text-ink-500">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

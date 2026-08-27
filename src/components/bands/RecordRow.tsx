import { EVIDENCE } from "@/lib/tokens"

// About band 03 — three stats in a bordered row on panel.
//
// Reads the SAME EVIDENCE constant as the homepage evidence band. The spec is
// explicit that section 6 is the single source; two hand-typed copies is how
// "500+" survived on one page after being corrected on another.
export default function RecordRow() {
  const stats = [
    { value: `${EVIDENCE.livesTouched}+`, label: "Lives touched" },
    { value: `${EVIDENCE.mentors}+`, label: "Active mentors" },
    { value: EVIDENCE.basedIn, label: "Where we work" },
  ]

  return (
    <section className="border-b border-ink-900/[.14] bg-panel px-5 py-12 lg:px-14 lg:py-[74px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[340px_1fr] lg:gap-16">
        <div>
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
            03 — The record
          </p>
          <h2 className="m-0 mt-4 font-display text-[32px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[44px]">
            Where we
            <br />
            are so far
          </h2>
          <p className="m-0 mt-[18px] font-body text-[13.5px] font-medium leading-[1.65] text-ink-600">
            Figures as reported at {EVIDENCE.asOf}. Full outcomes are published
            against each Sustainable Development Goal annually.
          </p>
        </div>

        <dl className="m-0 grid grid-cols-1 border-t-2 border-ink-900 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-7 ${i === 0 ? "sm:pr-[26px]" : i === 1 ? "sm:px-[26px]" : "sm:pl-[26px]"} ${
                i < 2 ? "border-b border-ink-900/[.16] sm:border-b-0 sm:border-r" : ""
              }`}
            >
              <dd className="m-0 font-display text-[52px] font-black leading-[.85] text-green-900 lg:text-[68px]">
                {s.value}
              </dd>
              <dt className="mt-3 font-body text-[11.5px] font-bold uppercase leading-[1.4] tracking-[.1em] text-ink-900">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

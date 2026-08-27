import { EVIDENCE } from "@/lib/tokens"
import CountUp from "../data/CountUp"
import DotMatrix from "../data/DotMatrix"

// Spec §4 band 01 — `1fr 380px`. Dot matrix left, three stats right behind a
// 2px ink-900 left border.
//
// Every figure comes from EVIDENCE in tokens.ts, the single source shared with
// /about. The client corrected these: 300+ (not 500+), 10+ (not 50+), and
// NIGERIA replacing "10+ countries reached" — international reach is a future
// claim, not a current one, and the country count must never return.
export default function Evidence() {
  return (
    <section className="border-b border-ink-900/[.14] bg-paper px-5 py-12 lg:px-14 lg:py-[74px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-[72px]">
        <div>
          <div className="flex items-baseline gap-4 lg:gap-[18px]">
            <CountUp
              value={EVIDENCE.livesTouched}
              suffix="+"
              className="font-display text-[64px] font-black leading-[.82] text-umber-800 lg:text-[96px]"
            />
            <span className="font-body text-[12px] font-bold uppercase leading-[1.4] tracking-[.1em] text-ink-900 lg:text-[13px]">
              Lives
              <br />
              touched
            </span>
          </div>
          <div className="mt-7 lg:mt-[34px]">
            <DotMatrix value={EVIDENCE.livesTouched} />
          </div>
        </div>

        <div className="border-l-2 border-ink-900 pl-5 lg:pl-[26px]">
          <Stat
            value={<CountUp value={EVIDENCE.mentors} suffix="+" />}
            label="Active mentors"
            note="One solid segment of ten. The pale segment carries “and above”."
            divider
          >
            {/* Same convention as the matrix, at a smaller scale. */}
            <div className="mt-3 flex gap-[3px]" aria-hidden="true">
              <span className="h-1.5 flex-1 bg-umber-600" />
              <span className="h-1.5 flex-1 bg-sand-400" />
            </div>
            <span className="sr-only">
              {EVIDENCE.mentors} or more active mentors.
            </span>
          </Stat>

          <Stat
            value={EVIDENCE.basedIn}
            label="Where we work"
            note="Based in Abuja, F.C.T. The programme runs nationally; international expansion is ahead of us, not behind."
            divider
          />

          <Stat
            value={<CountUp value={EVIDENCE.sdgAddressed.length} />}
            label={`Of ${EVIDENCE.sdgTotal} UN goals`}
            note="Charted in full below."
            last
          />
        </div>
      </div>
    </section>
  )
}

function Stat({
  value,
  label,
  note,
  children,
  divider = false,
  last = false,
}: {
  value: React.ReactNode
  label: string
  note: string
  children?: React.ReactNode
  divider?: boolean
  last?: boolean
}) {
  const spacing = last
    ? "pt-[22px]"
    : divider
      ? "border-b border-ink-900/[.14] pb-[22px] [&+*]:pt-[22px]"
      : ""
  return (
    <div className={spacing}>
      <p className="m-0 font-display text-[40px] font-black leading-[.85] text-ink-900 lg:text-[52px]">
        {value}
      </p>
      <p className="m-0 mt-2.5 font-body text-[11.5px] font-bold uppercase leading-[1.4] tracking-[.1em] text-ink-900">
        {label}
      </p>
      {children}
      <p className="m-0 mt-2.5 font-body text-[12px] font-medium leading-[1.55] text-ink-600">
        {note}
      </p>
    </div>
  )
}

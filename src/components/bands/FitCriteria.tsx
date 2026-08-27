// Mentor page band 01 — two columns of criteria.
//
// The right-hand column is the PERSUASIVE half (spec §5): most people who
// would be good at this rule themselves out. It is set in ink-400 under a
// sand-400 rule to read as secondary, but it must not be demoted further or
// dropped — it is doing the real work on this page.
export default function FitCriteria({
  asked,
  notRequired,
}: {
  asked: string[]
  notRequired: string[]
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <h3 className="m-0 border-b-2 border-ink-900 pb-4 font-body text-[11px] font-bold uppercase leading-none tracking-[.14em] text-ink-900">
          What we ask for
        </h3>
        <ul className="m-0 flex list-none flex-col p-0">
          {asked.map((item) => (
            <li
              key={item}
              className="border-b border-ink-900/[.14] py-[15px] font-body text-[14.5px] font-medium leading-[1.55] text-ink-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="m-0 border-b-2 border-sand-400 pb-4 font-body text-[11px] font-bold uppercase leading-none tracking-[.14em] text-ink-400">
          What we do not require
        </h3>
        <ul className="m-0 flex list-none flex-col p-0">
          {notRequired.map((item) => (
            <li
              key={item}
              className="border-b border-ink-900/[.14] py-[15px] font-body text-[14.5px] font-medium leading-[1.55] text-ink-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { EVIDENCE } from "@/lib/tokens"
import { GOALS } from "@/lib/sdg"
import SdgGrid from "../data/SdgGrid"

// Spec §4 band 02 — panel ground, `340px 1fr`.
export default function SdgBand() {
  return (
    <section className="border-b border-ink-900/[.14] bg-panel px-5 py-12 lg:px-14 lg:py-[78px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[340px_1fr] lg:gap-16">
        <div>
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
            02 — SDG alignment
          </p>
          <h2 className="m-0 mt-4 font-display text-[32px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[44px]">
            Seven of seventeen
          </h2>
          <p className="m-0 mt-[18px] font-body text-[13.5px] font-medium leading-[1.65] text-ink-600">
            Our programmes are designed against {EVIDENCE.sdgAddressed.length} of
            the United Nations Sustainable Development Goals. The remaining{" "}
            {GOALS.length - EVIDENCE.sdgAddressed.length} fall outside our
            mandate. Outcomes are reported against each filled goal annually.
          </p>
          <ul className="m-0 mt-6 flex list-none gap-5 p-0 font-body text-[11px] font-semibold uppercase leading-none tracking-[.06em] text-ink-600 lg:mt-[26px]">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3 w-3 bg-green-900" />
              Addressed
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3 w-3 bg-sand-300" />
              Out of scope
            </li>
          </ul>
        </div>
        <SdgGrid />
      </div>
    </section>
  )
}

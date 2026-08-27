import { MANDATE } from "@/lib/content"

// Spec §4 — green-900, 760px centred column. A statement band: no actions.
export default function Mandate({ heading = "Our mandate" }: { heading?: string } = {}) {
  return (
    <section className="bg-green-900 px-5 py-14 lg:px-14 lg:py-[88px]">
      <div className="mx-auto max-w-[820px] text-center">
        <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          {heading}
        </p>
        {/* Verbatim — the client's own words, read from content.ts. */}
        <p className="m-0 mt-6 font-body text-[17px] font-semibold leading-[1.6] tracking-[-.01em] text-white [text-wrap:pretty] lg:mt-[26px] lg:text-[23px] lg:leading-[1.55]">
          {MANDATE}
        </p>
      </div>
    </section>
  )
}

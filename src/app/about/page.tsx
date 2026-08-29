import Hero from "@/components/bands/Hero"
import Mandate from "@/components/bands/Mandate"
import ValuesSplit from "@/components/bands/ValuesSplit"
import RecordRow from "@/components/bands/RecordRow"
import Alignment from "@/components/bands/Alignment"
import ClosingBand from "@/components/bands/ClosingBand"
import { VISION } from "@/lib/content"

import HeroImage from "../../Images/MOA8.jpg"
import ValuesImage from "../../Images/MOA7.jpg"

// One sentence, two consumers: the visible hero lead and the page description
// that feeds search results and the social card. Typed twice they drift, and
// then the tab preview describes the page differently from the page itself.
const SUMMARY =
  "A non-profit registered in Nigeria, working across the continent to mentor young Africans in leadership, education, entrepreneurship and peace advocacy."

export const metadata = {
  title: "Who we are",
  description: SUMMARY,
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About the Foundation"
        eyebrowRule={false}
        headline={"Who we "}
        accent="are."
        lead={SUMMARY}
        image={HeroImage}
        alt="Presentation of leadership and governance titles at the Nigeria Police Force headquarters, Abuja"
        height="page"
      />

      {/* Verbatim mission — the same constant the homepage mandate band reads. */}
      <Mandate heading="Our mission" />

      <section className="border-b border-ink-900/[.14] bg-paper px-5 py-12 lg:px-14 lg:py-[74px]">
        <div className="mx-auto grid max-w-[1440px] items-start gap-8 lg:grid-cols-[340px_1fr] lg:gap-16">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              01 — Our vision
            </p>
            <h2 className="m-0 mt-4 font-display text-[32px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[44px]">
              What we are
              <br />
              building toward
            </h2>
          </div>
          {/* Verbatim — shared with the homepage vision band. */}
          <p className="m-0 max-w-[820px] font-body text-[16px] font-medium leading-[1.72] text-ink-700 [text-wrap:pretty] lg:text-[17px]">
            {VISION}
          </p>
        </div>
      </section>

      <ValuesSplit
        image={ValuesImage}
        alt="At a Women in Politics and Governance event in Abuja"
      />

      <RecordRow />

      <Alignment eyebrow="04 — Who we work with" heading={"Institutional\nalignment"} />

      <ClosingBand
        heading="Work with us"
        body="Whether you want to be mentored, to mentor, or to partner with the Foundation, the first step is the same conversation."
        actions={[
          { label: "Get in touch", href: "/contact", variant: "primary" },
          { label: "See our programs", href: "/programs", variant: "outline" },
        ]}
      />
    </>
  )
}

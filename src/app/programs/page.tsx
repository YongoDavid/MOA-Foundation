import Link from "next/link"
import Hero from "@/components/bands/Hero"
import ProgrammeBand from "@/components/bands/ProgrammeBand"
import ClosingBand from "@/components/bands/ClosingBand"
import { PROGRAMMES } from "@/lib/programmes"

import HeroImage from "../../Images/MOA6.jpg"

export const metadata = {
  title: "Four areas of work",
  description:
    "Everything the Foundation does sits under one of four headings: leadership, education, entrepreneurship and peace advocacy.",
  alternates: { canonical: "/programs" },
}

export default function ProgramsPage() {
  return (
    <>
      <Hero
        eyebrow="Programs"
        eyebrowRule={false}
        headline={"Four areas of\n"}
        accent="work."
        lead="Everything the Foundation does sits under one of four headings. Each runs on its own cycle, and each is open by application, whatever your age."
        image={HeroImage}
        alt="With embassy staff at the Embassy of the State of Kuwait in Abuja"
        height="page"
      />

      {/*
        A section index, not a tab control. All four bands render on this page,
        so these jump to them rather than switching a view. The mockup draws 01
        permanently active; that is dropped deliberately — a selected-looking
        item that never changes when you click the others reads as broken.
      */}
      <nav
        aria-label="Programme areas"
        className="border-b border-ink-900/[.14] bg-panel px-5 lg:px-14"
      >
        <ul className="mx-auto m-0 flex max-w-[1440px] list-none gap-6 overflow-x-auto p-0 lg:grid lg:grid-cols-4 lg:gap-0">
          {PROGRAMMES.map((p) => (
            <li key={p.slug} className="shrink-0">
              <Link
                href={`#${p.slug}`}
                className="block whitespace-nowrap border-b-2 border-transparent py-[22px] font-body text-[11px] font-bold uppercase leading-none tracking-[.1em] text-ink-900 transition-colors duration-150 hover:border-ink-900"
              >
                {String(p.index).padStart(2, "0")}
                <span className="px-2" />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {PROGRAMMES.map((p) => (
        <ProgrammeBand key={p.slug} programme={p} />
      ))}

      <ClosingBand
        heading={"Not sure which one\nfits you?"}
        body="Write to us with a sentence about where you are and what you want to build. Someone from the programme team will point you to the right place."
        actions={[
          { label: "Contact the team", href: "/contact", variant: "primary" },
          { label: "Read the blog", href: "/blog", variant: "outline" },
        ]}
      />
    </>
  )
}

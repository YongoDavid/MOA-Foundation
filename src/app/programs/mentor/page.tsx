import Hero from "@/components/bands/Hero"
import SectionHeader from "@/components/bands/SectionHeader"
import FitCriteria from "@/components/bands/FitCriteria"
import FormSplit from "@/components/bands/FormSplit"
import FaqBand from "@/components/bands/FaqBand"
import MentorForm from "@/components/forms/MentorForm"
import { SITE } from "@/lib/site"

import HeroImage from "../../../Images/MOA5.jpg"
import CriteriaHeaderImage from "../../../Images/MOA14.jpg"
import FormImage from "../../../Images/MOA2.jpg"

export const metadata = {
  title: "Become a mentor",
  description:
    "Mentors guide a small group of young Africans through a structured cycle, with support from the programme team throughout.",
  alternates: { canonical: "/programs/mentor" },
}

const ASKED = [
  "Established experience in your field, in any sector",
  "Willingness to be held to the curriculum rather than improvise",
  "Comfort with young people who disagree with you",
  "A clean child protection record",
]

const NOT_REQUIRED = [
  "A degree, or any particular qualification",
  "Residence in Nigeria — mentors serve from across the continent and beyond",
  "Prior mentoring or teaching experience",
  "A financial contribution of any kind",
]

const FAQS = [
  {
    q: "Can I mentor from outside Nigeria?",
    a: "Yes. Mentors serve from a number of countries and run their sessions online.",
  },
  {
    q: "What if my availability changes?",
    a: "Tell the programme team early. We can pair you with a co-mentor rather than move your mentees to someone they do not know.",
  },
  {
    q: "Do I choose my mentees?",
    a: "No. The programme team matches groups on field of interest and language, then reviews the match after the first month.",
  },
]

export default function MentorPage() {
  return (
    <>
      <Hero
        eyebrow="Programs / Become a mentor"
        eyebrowRule={false}
        headline={"Give your experience.\nChange a "}
        accent="trajectory."
        lead="Mentors guide a small group of young Africans through a structured cycle, with support from the programme team throughout. Get in touch and we will walk you through what the role involves."
        actions={[
          { label: "Apply to mentor", href: "#apply", variant: "primary" },
          { label: "Talk to the team first", href: "/contact", variant: "outline" },
        ]}
        image={HeroImage}
        alt="Talks in progress at the Embassy of Vietnam in Abuja"
        height="page"
      />

      <SectionHeader
        eyebrow="01 — Who we are looking for"
        heading="Fit matters more than seniority"
        image={CriteriaHeaderImage}
        alt="At a courtesy visit to a Chinese diplomatic mission in Abuja"
      />

      <section className="border-b border-ink-900/[.14] bg-paper px-5 py-12 lg:px-14 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <FitCriteria asked={ASKED} notRequired={NOT_REQUIRED} />

          <figure className="mt-10 grid items-center gap-6 border-l-[3px] border-umber-600 bg-panel px-6 py-[26px] lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-[30px]">
            <blockquote className="m-0 max-w-[820px] font-body text-[17px] font-medium leading-[1.55] text-green-quote [text-wrap:pretty] lg:text-[20px]">
              &ldquo;Four hours a month is less than I spend on a single meeting
              that goes nowhere. This one produces a person.&rdquo;
            </blockquote>
            <figcaption className="font-body text-[10.5px] font-bold uppercase leading-[1.5] tracking-[.14em] text-umber-800 lg:text-right">
              Programme mentor
              <br />
              Cohorts 2–4
            </figcaption>
          </figure>
        </div>
      </section>

      <div id="apply" className="scroll-mt-24">
        <FormSplit
          eyebrow="02 — Apply"
          heading="Mentor application"
          lead="Tell us a little about yourself and the programme team will be in touch with the full details."
          image={FormImage}
          alt="Greeting the Ambassador at the Embassy of Vietnam in Abuja"
          minHeight={640}
        >
          <MentorForm />
        </FormSplit>
      </div>

      <FaqBand
        eyebrow="03 — Questions"
        heading="Before you apply"
        items={FAQS}
      />
    </>
  )
}

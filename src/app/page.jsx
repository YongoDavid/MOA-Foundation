import Hero from "@/components/bands/Hero"
import Mandate from "@/components/bands/Mandate"
import SectionHeader from "@/components/bands/SectionHeader"
import Evidence from "@/components/bands/Evidence"
import SdgBand from "@/components/bands/SdgBand"
import Alignment from "@/components/bands/Alignment"
import VisionSplit from "@/components/bands/VisionSplit"
import Objectives from "@/components/bands/Objectives"
import Pathways from "@/components/bands/Pathways"
import RecentPosts from "@/components/bands/RecentPosts"
import NewsletterBand from "@/components/bands/NewsletterBand"
import { FLAGS } from "@/lib/content"

import HeroImage from "../Images/57462f6c-354a-4a34-8c42-b311b14f5d66.jpg"
import EvidenceHeaderImage from "../Images/MOA8.jpg"
import AlignmentHeaderImage from "../Images/MOA4.jpg"
import VisionImage from "../Images/MOA7.jpg"
import ObjectivesHeaderImage from "../Images/MOA6.jpg"
import PathwaysHeaderImage from "../Images/MOA9.jpg"
import MenteeImage from "../Images/MOA.jpg"
import MentorImage from "../Images/MOA10.jpg"

// Nine bands alternating paper, dark and photographic header. The alternation
// is the fix for the old site's nine-sections-at-identical-weight problem
// (spec §4) — preserve it.
export default function Home() {
  return (
    <>
      <Hero
        eyebrow="Don't just belong, stand out."
        headline={"Africa's Emerging Leaders\nfor "}
        accent="Excellence."
        lead="We mentor young Africans in leadership, education, entrepreneurship and peace advocacy — and report what that work produces."
        actions={[
          { label: "Read our mandate", href: "/about", variant: "primary" },
          { label: "Partner with us", href: "/contact", variant: "outline" },
        ]}
        image={HeroImage}
        alt="The Executive Director in conversation at a private engagement in Abuja"
        repeatTagline
      />

      <Mandate />

      <SectionHeader
        eyebrow="01 — The evidence"
        heading="The record so far"
        note="As of August 2026"
        image={EvidenceHeaderImage}
        alt="Presentation of leadership and governance titles at the Nigeria Police Force headquarters, Abuja"
      />
      <Evidence />

      <SdgBand />

      <SectionHeader
        eyebrow="03 — Who we work with"
        heading="Institutional alignment"
        image={AlignmentHeaderImage}
        alt="The Foundation delegation at the Embassy of the State of Kuwait in Abuja"
      />
      <Alignment />

      <VisionSplit
        image={VisionImage}
        alt="At a Women in Politics and Governance event in Abuja"
      />

      {/* Band 05 and its photographic header hide together (spec §4). */}
      {FLAGS.showObjectives ? (
        <>
          <SectionHeader
            eyebrow="05 — Aims & objectives"
            heading="Ten specific objectives"
            image={ObjectivesHeaderImage}
            alt="With embassy staff at the Embassy of the State of Kuwait in Abuja"
          />
          <Objectives />
        </>
      ) : null}

      <SectionHeader
        eyebrow="06 — Take part"
        heading="Three ways in"
        image={PathwaysHeaderImage}
        alt="At the Nigeria Police Force headquarters in Abuja"
      />
      <Pathways
        menteeImage={MenteeImage}
        menteeAlt="At a courtesy visit to the Embassy of Vietnam in Abuja"
        mentorImage={MentorImage}
        mentorAlt="With a senior police officer at a courtesy visit in Abuja"
      />

      <RecentPosts />

      <NewsletterBand />
    </>
  )
}

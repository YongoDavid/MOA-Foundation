import Hero from "@/components/bands/Hero"
import Mandate from "@/components/bands/Mandate"
import SectionHeader from "@/components/bands/SectionHeader"
import Evidence from "@/components/bands/Evidence"

// LEGACY bands, still in the old palette. Replaced in Tasks 4–5.
import ProgramsSection from "@/components/ProgramsSection"
import AboutSection from "@/components/AboutSection"
import NewsletterSection from "@/components/NewsletterSection"
import CTASection from "@/components/CTASection"
import LatestPostsBlock from "@/components/blog/LatestPostsBlock"

import HeroImage from "../Images/57462f6c-354a-4a34-8c42-b311b14f5d66.jpg"
import EvidenceHeaderImage from "../Images/MOA8.jpg"

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

      {/* ── Everything below is the old design, replaced in Tasks 4–5. ── */}
      <ProgramsSection />
      <AboutSection />
      <LatestPostsBlock />
      <CTASection />
      <NewsletterSection />
    </>
  )
}

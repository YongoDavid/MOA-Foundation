import Hero from "@/components/bands/Hero"
import FormSplit from "@/components/bands/FormSplit"
import FaqBand from "@/components/bands/FaqBand"
import MenteeForm from "@/components/forms/MenteeForm"

import HeroImage from "../../../Images/MOA.jpg"
import FormImage from "../../../Images/MOA13.jpg"

export const metadata = {
  title: "Apply as a mentee",
  description:
    "Tell us about yourself. The programme team reads every application and will come back to you with the next step.",
  alternates: { canonical: "/programs/apply" },
}

const FAQS = [
  {
    q: "Who can apply?",
    a: "Anyone, wherever you live — there is no age limit. If you are under 18 we will ask for a parent or guardian to confirm.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Mentoring is free to mentees, and mentors are volunteers.",
  },
  {
    q: "Do I need to be in Abuja?",
    a: "No. Some groups meet in person in Abuja, others meet online.",
  },
  {
    q: "What if I am not selected this time?",
    a: "We keep your application and write to you when the next cycle opens. Applying again is welcome.",
  },
]

export default function ApplyPage() {
  return (
    <>
      <Hero
        eyebrow="Programs / Apply as a mentee"
        eyebrowRule={false}
        headline={"Start where\nyou "}
        accent="are."
        lead="Tell us about yourself. The programme team reads every application and will come back to you with the next step."
        image={HeroImage}
        alt="At a courtesy visit to the Embassy of Vietnam in Abuja"
        height="page"
      />

      <FormSplit
        eyebrow="Mentee application"
        heading="About you"
        lead="Nothing here needs to be polished. Write plainly and we will understand."
        image={FormImage}
        alt="Discussing scholarship pathways at the Embassy of Vietnam in Abuja"
      >
        <MenteeForm />
      </FormSplit>

      <FaqBand heading={"Before you\napply"} intro items={FAQS} />
    </>
  )
}

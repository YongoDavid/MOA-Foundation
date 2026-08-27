import type { StaticImageData } from "next/image"
import Leadership from "../Images/MOA8.jpg"
import Education from "../Images/MOA13.jpg"
import Peace from "../Images/be51d512-c4c2-40cf-8363-8fe352b405b5.jpg"

// The four programme areas (spec §11, Programme).
//
// `media` is either a photograph or a typographic panel. Band 03 has no
// photograph because none of the client's nineteen images depicts enterprise
// or skills work — spec §8 is explicit that an unrelated image must not be
// substituted, so the media half becomes a green-900 statement panel instead.

export type ProgrammeMedia =
  | { kind: "photo"; image: StaticImageData; alt: string }
  | { kind: "panel"; eyebrow: string; statement: string }

export type Programme = {
  slug: string
  index: number
  name: string
  /** Two lines; \n is the break. */
  heading: string
  body: string
  sdgs: number[]
  media: ProgrammeMedia
  actions: { label: string; href: string; variant: "primary" | "outline" }[]
}

export const PROGRAMMES: Programme[] = [
  {
    slug: "leadership",
    index: 1,
    name: "Leadership",
    heading: "Leadership\nmentoring",
    body: "Small groups meet with a serving professional through a structured cycle, working on ethics, decision-making and public responsibility. Mentees finish with a personal development plan and a mentor they can still call.",
    sdgs: [4, 5, 16],
    media: {
      kind: "photo",
      image: Leadership,
      alt: "Presentation of leadership and governance titles at the Nigeria Police Force headquarters, Abuja",
    },
    actions: [
      { label: "Apply as a mentee", href: "/programs/apply", variant: "primary" },
      { label: "Ask about this programme", href: "/contact", variant: "outline" },
    ],
  },
  {
    slug: "education",
    index: 2,
    name: "Education",
    heading: "Education\naccess",
    body: "We work with community schools to return out-of-school children to the classroom, and with partners on scholarship pathways for mentees leaving secondary school. Support ranges from learning materials to school fees.",
    sdgs: [1, 4, 10],
    media: {
      kind: "photo",
      image: Education,
      alt: "Discussing scholarship pathways at the Embassy of Vietnam in Abuja",
    },
    actions: [
      { label: "Nominate a school", href: "/contact", variant: "primary" },
      { label: "Ask about this programme", href: "/contact", variant: "outline" },
    ],
  },
  {
    slug: "entrepreneurship",
    index: 3,
    name: "Entrepreneurship",
    heading: "Enterprise\nand skills",
    body: "Practical training for young people building something of their own, delivered by people who have done it. The emphasis is on enterprises that last and employ others, not on quick wins.",
    sdgs: [2, 8, 9],
    media: {
      kind: "panel",
      eyebrow: "Aim 10",
      statement: "Encouraging creativity and forward-thinking solutions.",
    },
    actions: [
      { label: "Apply for training", href: "/contact", variant: "primary" },
      { label: "Ask about this programme", href: "/contact", variant: "outline" },
    ],
  },
  {
    slug: "peace-advocacy",
    index: 4,
    name: "Peace advocacy",
    heading: "Peace\nadvocacy",
    body: "Mentees are trained as peace ambassadors in their own communities, and the Foundation engages institutions on youth participation, conflict prevention and civic responsibility.",
    sdgs: [16, 5],
    media: {
      kind: "photo",
      image: Peace,
      alt: "At the African Chiefs of Defence Staff Summit 2025 in Abuja",
    },
    actions: [
      { label: "Become an ambassador", href: "/contact", variant: "primary" },
      { label: "Ask about this programme", href: "/contact", variant: "outline" },
    ],
  },
]

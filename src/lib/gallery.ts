import type { StaticImageData } from "next/image"

import Engagement1 from "../Images/57462f6c-354a-4a34-8c42-b311b14f5d66.jpg"
import Engagement2 from "../Images/92137868-d04a-4e2a-af04-4f69644c5dd4.jpg"
import Summit1 from "../Images/be51d512-c4c2-40cf-8363-8fe352b405b5.jpg"
import Engagement3 from "../Images/c2b8efab-e3d4-43bc-9e5a-511677835b3e.jpg"
import Kuwait3 from "../Images/c5c051a9-feae-4af7-ae66-1fd4787d43b1.jpg"
import Engagement4 from "../Images/ca2162dc-cbd1-4311-95d6-7a9d0d954d9e-2.jpg"
import Vietnam1 from "../Images/MOA.jpg"
import Vietnam2 from "../Images/MOA1.jpg"
import Vietnam3 from "../Images/MOA2.jpg"
import Vietnam4 from "../Images/MOA3.jpg"
import Kuwait1 from "../Images/MOA4.jpg"
import Vietnam5 from "../Images/MOA5.jpg"
import Kuwait2 from "../Images/MOA6.jpg"
import Advocacy1 from "../Images/MOA7.jpg"
import Police1 from "../Images/MOA8.jpg"
import Police2 from "../Images/MOA9.jpg"
import Police3 from "../Images/MOA10.jpg"
import Vietnam6 from "../Images/MOA13.jpg"
import China1 from "../Images/MOA14.jpg"

/**
 * The gallery manifest (spec §9, gallery mockup).
 *
 * These are REAL Foundation engagements — embassies, the Nigeria Police Force
 * headquarters, a continental summit. The alt text and category for each come
 * from the handoff document, which named them. Do not paraphrase an alt into
 * something vaguer; "at an embassy" instead of the named embassy loses the
 * only record of what the photograph shows.
 *
 * NO CAPTURE DATES. The handoff mockup draws a "2026 ▾" year filter but gives
 * no per-photograph date, and one image is captioned "Chiefs of Defence Staff
 * 2025" — so a 2026 default would hide it. Assigning years by guesswork would
 * put false dates on a real organisation's diplomatic record, so the year
 * control is not built. Add a `year` field here once the Foundation supplies
 * real dates, then the filter is a small change.
 */

export const GALLERY_CATEGORIES = [
  "Courtesy visits",
  "Summits",
  "Governance",
  "Advocacy",
  "Engagements",
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

export type Photo = {
  image: StaticImageData
  alt: string
  category: GalleryCategory
  /** Shown over the tile. Only the mockup's feature tiles carry one. */
  caption?: string
  /** Feature tiles. "wide" spans two columns; "feature" spans two of each. */
  span?: "wide" | "feature"
}

export const PHOTOS: Photo[] = [
  {
    image: Engagement1,
    alt: "The Executive Director in conversation at a private engagement",
    category: "Engagements",
    caption: "A private engagement, Abuja",
    span: "feature",
  },
  {
    image: Vietnam1,
    alt: "At a courtesy visit to the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Vietnam2,
    alt: "The Foundation delegation at the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Vietnam4,
    alt: "In discussion at the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Vietnam5,
    alt: "Talks in progress at the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Kuwait1,
    alt: "The Foundation delegation at the Embassy of the State of Kuwait in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Kuwait2,
    alt: "With embassy staff at the Embassy of the State of Kuwait in Abuja",
    category: "Courtesy visits",
    caption: "Embassy of Kuwait, Abuja",
    span: "wide",
  },
  {
    image: Police1,
    alt: "Presentation of leadership and governance titles at the Nigeria Police Force headquarters, Abuja",
    category: "Governance",
    caption: "Nigeria Police Force HQ",
  },
  {
    image: Police2,
    alt: "At the Nigeria Police Force headquarters in Abuja",
    category: "Governance",
  },
  {
    image: Police3,
    alt: "With a senior police officer at a courtesy visit in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Vietnam6,
    alt: "Discussing scholarship pathways at the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
  },
  {
    image: China1,
    alt: "At a courtesy visit to a Chinese diplomatic mission in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Vietnam3,
    alt: "Greeting the Ambassador at the Embassy of Vietnam in Abuja",
    category: "Courtesy visits",
    caption: "Embassy of Vietnam, Abuja",
    span: "wide",
  },
  {
    image: Advocacy1,
    alt: "At a Women in Politics and Governance event in Abuja",
    category: "Advocacy",
    caption: "Women in Politics forum",
  },
  {
    image: Engagement2,
    alt: "The Executive Director at a private engagement in Abuja",
    category: "Engagements",
  },
  {
    image: Summit1,
    alt: "At the African Chiefs of Defence Staff Summit 2025 in Abuja",
    category: "Summits",
    caption: "Chiefs of Defence Staff 2025",
  },
  {
    image: Engagement3,
    alt: "With a visiting dignitary at an engagement in Abuja",
    category: "Engagements",
  },
  {
    image: Kuwait3,
    alt: "At the Embassy of the State of Kuwait in Abuja",
    category: "Courtesy visits",
  },
  {
    image: Engagement4,
    alt: "A Foundation engagement in Abuja",
    category: "Engagements",
  },
]

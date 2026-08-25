// Blog prototype — the ONLY data source.
//
// No backend, no fetch, no API routes. Every blog surface reads from here.
// Shapes come from blog-types.ts, which mirrors spec §6, so replacing this
// module with a real database later changes where data comes from — not the
// components that consume it.
//
// Copy is taken from the approved mockups (MAMF Blog.dc.html). Photography is
// real MOA imagery via static import, so next/image gets true intrinsic
// dimensions. Never hardcode width/height on a static import.

import MOA from "@/Images/MOA.jpg"
import MOA1 from "@/Images/MOA1.jpg"
import MOA2 from "@/Images/MOA2.jpg"
import MOA3 from "@/Images/MOA3.jpg"
import MOA4 from "@/Images/MOA4.jpg"
import MOA5 from "@/Images/MOA5.jpg"
import MOA6 from "@/Images/MOA6.jpg"
import MOA8 from "@/Images/MOA8.jpg"
import MOA9 from "@/Images/MOA9.jpg"
import MOA10 from "@/Images/MOA10.jpg"
import MOA12 from "@/Images/MOA12.jpg"
import MOA13 from "@/Images/MOA13.jpg"

import type { Comment, MediaItem, Post, StaticImageDataLike } from "./blog-types"

/** Build a MediaItem from a static import so width/height stay truthful. */
function media(img: StaticImageDataLike, alt: string): MediaItem {
  return { url: img, alt, width: img.width, height: img.height }
}

export const POSTS: Post[] = [
  {
    slug: "embassy-of-kuwait-youth-education-partnership",
    title:
      "Courtesy visit to the Embassy of Kuwait on youth education partnerships",
    excerpt:
      "Our delegation met embassy staff in Abuja to discuss scholarship pathways for mentees finishing secondary school.",
    type: "gallery",
    category: "partnerships",
    status: "published",
    cover: media(
      MOA,
      "MOA delegation with embassy staff during the courtesy visit in Abuja",
    ),
    author: "Comms Team",
    publishedAt: "2026-08-14",
    readTime: 4,
    mediaCount: 18,
    tags: ["partnerships", "scholarships", "abuja"],
    featured: true,
    commentCount: 24,
    blocks: [
      {
        kind: "paragraph",
        text: "Last week our team was received at the Embassy of the State of Kuwait in Abuja to discuss scholarship pathways for mentees completing secondary school. The conversation covered three areas: technical training placements, language support, and a pilot exchange for ten students in the 2027 cohort.",
      },
      {
        kind: "paragraph",
        text: "The visit closed with an agreement to draft a memorandum before the end of the year. Below, a few moments from the day.",
      },
      {
        kind: "gallery",
        items: [
          media(MOA1, "Delegation members seated during the embassy briefing"),
          media(MOA2, "Handshake between MOA representatives and embassy staff"),
          media(MOA3, "Group photograph at the close of the courtesy visit"),
        ],
      },
      {
        kind: "video",
        poster: media(
          MOA4,
          "Executive Director addressing the room at the close of the visit",
        ),
        duration: "2:41",
        caption: "Remarks from our Executive Director at the close of the visit.",
      },
      {
        kind: "quote",
        text: "Partnerships like this one turn a mentee's ambition into an actual seat in a classroom.",
        attribution: "Executive Director",
      },
    ],
  },
  {
    slug: "cohort-4-mentors-meet-mentees-abuja",
    title: "Cohort 4 mentors meet their mentees in Abuja",
    excerpt:
      "Forty pairs met for the first time at the cohort launch, setting goals for the year ahead.",
    type: "gallery",
    category: "mentorship",
    status: "published",
    cover: media(MOA5, "Mentors and mentees introducing themselves at the Cohort 4 launch"),
    author: "Grace A.",
    publishedAt: "2026-08-09",
    readTime: 3,
    mediaCount: 12,
    tags: ["mentorship", "cohort-4", "abuja"],
    featured: false,
    commentCount: 12,
    blocks: [
      {
        kind: "paragraph",
        text: "Cohort 4 opened with forty mentor-mentee pairs meeting face to face for the first time. Each pair spent the morning setting goals for the year and agreeing how often they will meet.",
      },
      { kind: "heading", text: "What the first session covers" },
      {
        kind: "paragraph",
        text: "Mentors work through a short structured agenda: strengths, the mentee's own stated ambition, and one concrete step to take before the next meeting.",
      },
      {
        kind: "image",
        media: media(MOA6, "A mentor and mentee talking during the goal-setting session"),
        caption: "Goal-setting in pairs, Cohort 4 launch.",
      },
    ],
  },
  {
    slug: "leadership-summit-highlights",
    title: "“Don't just belong, stand out” — highlights from the leadership summit",
    excerpt:
      "Three days of workshops, panels and mentoring clinics, condensed into a short film.",
    type: "video",
    category: "mentorship",
    status: "published",
    cover: media(MOA8, "Delegates applauding during the closing session of the leadership summit"),
    author: "Comms Team",
    publishedAt: "2026-08-02",
    readTime: 2,
    videoDuration: "2:41",
    tags: ["mentorship", "summit"],
    featured: false,
    commentCount: 31,
    blocks: [
      {
        kind: "paragraph",
        text: "The summit brought together mentees from four states for three days of workshops, panels and mentoring clinics. This short film covers the moments that mattered most to them.",
      },
      {
        kind: "video",
        poster: media(MOA8, "Delegates applauding during the closing session of the leadership summit"),
        duration: "2:41",
        caption: "Highlights from the three-day leadership summit.",
      },
    ],
  },
  {
    slug: "120-children-return-to-class-nasarawa",
    title: "120 out-of-school children return to class in Nasarawa",
    excerpt:
      "A term of enrolment support, uniforms and fee assistance brought 120 pupils back into the classroom.",
    type: "gallery",
    category: "education",
    status: "published",
    cover: media(MOA9, "Pupils in uniform outside their classroom in Nasarawa"),
    author: "Dr. E. Musa",
    publishedAt: "2026-07-28",
    readTime: 5,
    mediaCount: 8,
    tags: ["education", "nasarawa", "enrolment"],
    featured: false,
    commentCount: 7,
    blocks: [
      {
        kind: "paragraph",
        text: "Working with three community schools, we identified 120 children who had dropped out in the previous two years and worked with their families to get them re-enrolled.",
      },
      {
        kind: "quote",
        text: "The barrier is almost never willingness. It is uniforms, fees and a way to get there.",
        attribution: "Programme Lead, Education",
      },
      {
        kind: "paragraph",
        text: "Each family received enrolment support and a term of fee assistance. We will follow this cohort through to the end of the academic year.",
      },
    ],
  },
  {
    slug: "back-to-school-kits-kaduna",
    title: "Back-to-school kits reach 300 pupils in Kaduna",
    excerpt:
      "Volunteers spent the weekend packing and delivering kits across four community schools.",
    type: "gallery",
    category: "outreach",
    status: "published",
    cover: media(MOA10, "Volunteers packing back-to-school kits for distribution in Kaduna"),
    author: "Grace A.",
    publishedAt: "2026-07-21",
    readTime: 3,
    mediaCount: 9,
    tags: ["outreach", "kaduna"],
    featured: false,
    commentCount: 5,
    blocks: [
      {
        kind: "paragraph",
        text: "Volunteers spent the weekend packing and delivering back-to-school kits across four community schools in Kaduna. Each kit holds exercise books, pens, a mathematical set and a school bag.",
      },
      {
        kind: "image",
        media: media(MOA12, "Pupils receiving their back-to-school kits in a school courtyard"),
        caption: "Distribution at the second of four schools.",
      },
    ],
  },
  {
    slug: "a-mentees-first-year",
    title: "A mentee's first year, in her own words",
    excerpt:
      "Blessing joined the programme at 16. She talks through what changed.",
    type: "video",
    category: "mentorship",
    status: "published",
    cover: media(MOA13, "Blessing speaking to camera about her first year in the programme"),
    author: "Comms Team",
    publishedAt: "2026-07-15",
    readTime: 2,
    videoDuration: "5:12",
    tags: ["mentorship", "stories"],
    featured: false,
    commentCount: 9,
    blocks: [
      {
        kind: "paragraph",
        text: "Blessing joined the programme at 16, midway through secondary school. A year on, she talks through what changed — and what she would tell someone starting now.",
      },
      {
        kind: "video",
        poster: media(MOA13, "Blessing speaking to camera about her first year in the programme"),
        duration: "5:12",
        caption: "Blessing, Cohort 3 mentee.",
      },
    ],
  },
  {
    slug: "three-years-mentoring-secondary-schools",
    title: "What we learned from three years of mentoring in secondary schools",
    excerpt:
      "Our programme lead sets out the four things that consistently move a mentee forward — and the two we stopped doing.",
    type: "story",
    category: "education",
    status: "published",
    cover: null,
    author: "Dr. E. Musa",
    publishedAt: "2026-07-04",
    readTime: 7,
    tags: ["education", "programme-design"],
    featured: false,
    commentCount: 3,
    blocks: [
      {
        kind: "paragraph",
        text: "Three years in, the pattern is clearer than we expected. Four things consistently move a mentee forward, and two things we invested in early turned out not to.",
      },
      { kind: "heading", text: "What works" },
      {
        kind: "paragraph",
        text: "Consistency beats intensity. A mentor who meets a mentee briefly every fortnight for a year achieves more than one who runs an intensive week and disappears.",
      },
      {
        kind: "quote",
        text: "The mentees who progressed fastest were not the ones with the most contact hours. They were the ones whose mentor never missed a meeting.",
        attribution: "Dr. E. Musa, Programme Lead",
      },
      { kind: "heading", text: "What we stopped" },
      {
        kind: "paragraph",
        text: "We stopped large-group motivational sessions and stopped issuing printed workbooks. Neither changed outcomes, and both consumed budget better spent on travel stipends.",
      },
    ],
  },
]

export const COMMENTS: Comment[] = [
  {
    id: "c1",
    postSlug: "embassy-of-kuwait-youth-education-partnership",
    parentId: null,
    name: "Adaeze N.",
    isStaff: false,
    body: "This is wonderful news. Will the exchange be open to mentees outside Abuja?",
    createdAt: "2026-08-14T14:20:00Z",
    likeCount: 6,
  },
  {
    id: "c2",
    postSlug: "embassy-of-kuwait-youth-education-partnership",
    parentId: "c1",
    name: "Comms Team",
    isStaff: true,
    body: "Yes — all four states in the programme are eligible. We will publish the criteria here next month.",
    createdAt: "2026-08-14T15:05:00Z",
    likeCount: 11,
  },
  {
    id: "c3",
    postSlug: "embassy-of-kuwait-youth-education-partnership",
    parentId: null,
    name: "Samuel O.",
    isStaff: false,
    body: "I volunteer with a school in Nasarawa and would like to help with the language support piece. Who do I contact?",
    createdAt: "2026-08-13T09:40:00Z",
    likeCount: 3,
  },
  {
    id: "c4",
    postSlug: "120-children-return-to-class-nasarawa",
    parentId: null,
    name: "Ifeoma K.",
    isStaff: false,
    body: "Brilliant work. Is the fee assistance renewable for a second term?",
    createdAt: "2026-07-29T11:15:00Z",
    likeCount: 2,
  },
]

/** Published posts, newest first. */
export function getPosts(): Post[] {
  return POSTS.filter((p) => p.status === "published").sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )
}

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug && p.status === "published")
}

export function getPostsByCategory(category: string): Post[] {
  return getPosts().filter((p) => p.category === category)
}

/** The index hero. Falls back to the newest post if none is flagged. */
export function getFeatured(): Post | undefined {
  return getPosts().find((p) => p.featured) ?? getPosts()[0]
}

/** Newest first, replies excluded — CommentThread nests them under parents. */
export function getComments(slug: string): Comment[] {
  return COMMENTS.filter((c) => c.postSlug === slug)
}

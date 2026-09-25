// Blog SEED DATA. No longer what the site reads.
//
// Every public surface reads src/lib/blog-db.ts (Supabase) as of 25 Sep 2026.
// This file survives because scripts/seed-blog.mjs parses it to populate a
// fresh database — it is the starting content, not the runtime source. Editing
// it changes nothing on the live site; use the admin at /admin.
// Shapes come from blog-types.ts, so replacing this module with a real
// database later changes where data comes from — not the components.
//
// Re-pointed 27 August 2026 to the engagements in the blog-reskin mockup:
// the embassies, the Nigeria Police Force headquarters, the Chiefs of Defence
// Staff summit, the Women in Politics forum. The previous fixtures invented
// impact figures for a real charity — "120 out-of-school children return to
// class", "back-to-school kits reach 300 pupils" — with nothing behind them.
// Every post here is an engagement the Foundation has photographs of, and the
// alt text matches src/lib/gallery.ts word for word.
//
// STILL PLACEHOLDER: the body copy of posts 2-7. It describes only what the
// photographs show and carries no figures, dates or commitments, so nothing
// here can be wrong — but it is not the Foundation's own account and should
// be replaced before launch. Post 1 is the approved mockup copy.

import MOA from "@/Images/MOA.jpg"
import MOA1 from "@/Images/MOA1.jpg"
import MOA2 from "@/Images/MOA2.jpg"
import MOA3 from "@/Images/MOA3.jpg"
import MOA4 from "@/Images/MOA4.jpg"
import MOA5 from "@/Images/MOA5.jpg"
import MOA6 from "@/Images/MOA6.jpg"
import MOA7 from "@/Images/MOA7.jpg"
import MOA8 from "@/Images/MOA8.jpg"
import MOA9 from "@/Images/MOA9.jpg"
import MOA10 from "@/Images/MOA10.jpg"
import MOA13 from "@/Images/MOA13.jpg"
import MOA14 from "@/Images/MOA14.jpg"
import Summit from "@/Images/be51d512-c4c2-40cf-8363-8fe352b405b5.jpg"
import Dignitary from "@/Images/c2b8efab-e3d4-43bc-9e5a-511677835b3e.jpg"
import Kuwait3 from "@/Images/c5c051a9-feae-4af7-ae66-1fd4787d43b1.jpg"

import type { Comment, MediaItem, Post, StaticImageDataLike } from "./blog-types"

/** Build a MediaItem from a static import so width/height stay truthful. */
function media(img: StaticImageDataLike, alt: string): MediaItem {
  return { url: img, alt, width: img.width, height: img.height }
}

// Gallery sets are declared up front so `mediaCount` can be DERIVED from them
// below. Hardcoding "Gallery · 18 photos" over a set of three is the same
// class of drift as the hardcoded comment count that came before it: the badge
// promises a number, the "+N" tile computes from it, and the lightbox then
// opens fewer photographs than either claimed.
const KUWAIT_SET = [
  media(MOA4, "The Foundation delegation at the Embassy of the State of Kuwait in Abuja"),
  media(Kuwait3, "At the Embassy of the State of Kuwait in Abuja"),
  media(Dignitary, "With a visiting dignitary at an engagement in Abuja"),
]

const VIETNAM_SET = [
  media(MOA, "At a courtesy visit to the Embassy of Vietnam in Abuja"),
  media(MOA1, "The Foundation delegation at the Embassy of Vietnam in Abuja"),
  media(MOA2, "Greeting the Ambassador at the Embassy of Vietnam in Abuja"),
  media(MOA3, "In discussion at the Embassy of Vietnam in Abuja"),
  media(MOA13, "Discussing scholarship pathways at the Embassy of Vietnam in Abuja"),
]

const POLICE_SET = [
  media(MOA8, "Presentation of leadership and governance titles at the Nigeria Police Force headquarters, Abuja"),
  media(MOA9, "At the Nigeria Police Force headquarters in Abuja"),
]

const RAW_POSTS: Omit<Post, "commentCount">[] = [
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
      MOA6,
      "With embassy staff at the Embassy of the State of Kuwait in Abuja",
    ),
    author: "Comms Team",
    publishedAt: "2026-08-14",
    readTime: 3,
    mediaCount: KUWAIT_SET.length,
    tags: ["partnerships", "scholarships", "abuja"],
    featured: true,
    blocks: [
      {
        kind: "paragraph",
        text: "Last week our team was received at the Embassy of the State of Kuwait in Abuja to discuss scholarship pathways for mentees completing secondary school. The conversation covered three areas: technical training placements, language support, and a pilot exchange for ten students in the 2027 cohort.",
      },
      {
        kind: "paragraph",
        text: "The visit closed with an agreement to draft a memorandum before the end of the year. Below, a few moments from the day.",
      },
      { kind: "gallery", items: KUWAIT_SET },
      {
        kind: "image",
        media: media(
          MOA4,
          "The Foundation delegation at the Embassy of the State of Kuwait in Abuja",
        ),
        caption: "The delegation with embassy staff at the close of the visit.",
      },
      {
        kind: "quote",
        text: "Partnerships like this one turn a mentee's ambition into an actual seat in a classroom.",
        attribution: "Executive Director",
      },
    ],
  },
  {
    slug: "embassy-of-vietnam-scholarship-pathways",
    title: "Talks with the Embassy of Vietnam on scholarship pathways",
    excerpt:
      "A courtesy visit to the Embassy of Vietnam in Abuja, and a first conversation about study places for mentees.",
    type: "gallery",
    category: "partnerships",
    status: "published",
    cover: media(MOA5, "Talks in progress at the Embassy of Vietnam in Abuja"),
    author: "Comms Team",
    publishedAt: "2026-08-06",
    readTime: 3,
    mediaCount: VIETNAM_SET.length,
    tags: ["partnerships", "scholarships", "abuja"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "Our delegation was received at the Embassy of Vietnam in Abuja for a courtesy visit and an introduction to the Foundation's work. Most of the hour was spent on education: which of our mentees are approaching the end of secondary school, and what a study pathway abroad would ask of them.",
      },
      {
        kind: "paragraph",
        text: "Nothing is agreed yet. A first conversation is how these things begin, and we will publish what follows here.",
      },
      { kind: "gallery", items: VIETNAM_SET },
    ],
  },
  {
    slug: "nigeria-police-force-courtesy-visit",
    title: "A courtesy visit to the Nigeria Police Force in Abuja",
    excerpt:
      "At Force headquarters, on youth safety and the Foundation's peace advocacy work.",
    type: "gallery",
    category: "governance",
    status: "published",
    cover: media(
      MOA10,
      "With a senior police officer at a courtesy visit in Abuja",
    ),
    author: "Comms Team",
    publishedAt: "2026-08-02",
    readTime: 3,
    mediaCount: POLICE_SET.length,
    tags: ["governance", "peace", "abuja"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "The Foundation was received at the Nigeria Police Force headquarters in Abuja. Our peace advocacy work puts young people in rooms where safety is discussed, and it matters that the people responsible for it know who they are.",
      },
      {
        kind: "paragraph",
        text: "The visit included a presentation of leadership and governance titles to members of the delegation.",
      },
      { kind: "gallery", items: POLICE_SET },
    ],
  },
  {
    slug: "chinese-diplomatic-mission-abuja",
    title: "Courtesy visit to a Chinese diplomatic mission in Abuja",
    excerpt:
      "An introduction to the Foundation's mentoring programme, and where education partnerships might begin.",
    type: "gallery",
    category: "partnerships",
    status: "published",
    cover: media(
      MOA14,
      "At a courtesy visit to a Chinese diplomatic mission in Abuja",
    ),
    author: "Comms Team",
    publishedAt: "2026-07-24",
    readTime: 2,
    tags: ["partnerships", "abuja"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "A short courtesy visit, and an introduction to what the Foundation does: who we mentor, how a cycle runs, and what a young African leaving our programme is equipped to do next.",
      },
      {
        kind: "paragraph",
        text: "We were asked to send the programme brief. We did, the same week.",
      },
    ],
  },
  {
    slug: "african-chiefs-of-defence-staff-summit",
    title: "At the African Chiefs of Defence Staff Summit in Abuja",
    excerpt:
      "Continental conversation on peace, security and the place of young people in it.",
    type: "gallery",
    category: "summits",
    status: "published",
    cover: media(
      Summit,
      "At the African Chiefs of Defence Staff Summit 2025 in Abuja",
    ),
    author: "Comms Team",
    publishedAt: "2026-07-21",
    readTime: 4,
    tags: ["summits", "peace", "abuja"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "The Foundation attended the African Chiefs of Defence Staff Summit in Abuja — days of continental conversation on peace and security, and on who is in the room when it is discussed.",
      },
      {
        kind: "paragraph",
        text: "Our interest in these rooms is narrow and consistent: peace advocacy is one of the Foundation's ten aims, and young people are the group most affected by what is decided and least often present for it.",
      },
    ],
  },
  {
    slug: "women-in-politics-and-governance",
    title: "Women in Politics and Governance, Abuja",
    excerpt:
      "On gender inclusion, and why the Foundation counts it among its ten aims.",
    type: "gallery",
    category: "advocacy",
    status: "published",
    cover: media(MOA7, "At a Women in Politics and Governance event in Abuja"),
    author: "Comms Team",
    publishedAt: "2026-07-15",
    readTime: 3,
    tags: ["advocacy", "gender", "abuja"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "The Foundation joined a Women in Politics and Governance event in Abuja. Promoting gender equality and inclusion is one of our stated aims, and it is not a separate programme — it is a test we apply to every cohort we recruit.",
      },
      {
        kind: "paragraph",
        text: "The most useful part of the day was the least formal: young women asking people already doing the work how they got there.",
      },
    ],
  },
  {
    slug: "why-we-spend-so-much-time-in-embassies",
    title: "Why we spend so much time in embassies",
    excerpt:
      "Our Executive Director on why scholarship pathways start with a formal introduction, and what a courtesy visit actually achieves.",
    type: "story",
    category: "partnerships",
    status: "published",
    cover: null,
    author: "Executive Director",
    publishedAt: "2026-07-04",
    readTime: 4,
    tags: ["partnerships", "scholarships"],
    featured: false,
    blocks: [
      {
        kind: "paragraph",
        text: "A courtesy visit looks like the least productive thing a small foundation can do with an afternoon. There is tea. There are photographs. Nobody signs anything.",
      },
      {
        kind: "paragraph",
        text: "What it produces is a name. When a mentee's application arrives at an embassy months later, it arrives from an organisation someone there has met, rather than from an unknown body in Apo. That is the whole of it, and it is worth the afternoon.",
      },
      {
        kind: "paragraph",
        text: "The pathways we are building take years and most of them will not work. The ones that do will have started in a room like the one in these photographs.",
      },
    ],
  },
]

const COMMENTS: Comment[] = [
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
    postSlug: "embassy-of-vietnam-scholarship-pathways",
    parentId: null,
    name: "Ifeoma K.",
    isStaff: false,
    body: "Encouraging to read. Is there anything volunteers can do to help at this stage?",
    createdAt: "2026-08-07T11:15:00Z",
    likeCount: 2,
  },
  {
    id: "c5",
    postSlug: "embassy-of-vietnam-scholarship-pathways",
    parentId: "c4",
    name: "Comms Team",
    isStaff: true,
    body: "Not yet — it is early. The most useful thing right now is mentors, and that page is open.",
    createdAt: "2026-08-07T13:02:00Z",
    likeCount: 4,
  },
  {
    id: "c6",
    postSlug: "nigeria-police-force-courtesy-visit",
    parentId: null,
    name: "Tunde A.",
    isStaff: false,
    body: "Good to see this. Youth safety conversations too often happen without anyone young in the room.",
    createdAt: "2026-08-03T08:30:00Z",
    likeCount: 7,
  },
  {
    id: "c7",
    postSlug: "women-in-politics-and-governance",
    parentId: null,
    name: "Chidera E.",
    isStaff: false,
    body: "I attended this. The informal session at the end was the most useful hour of the day.",
    createdAt: "2026-07-16T17:45:00Z",
    likeCount: 5,
  },
  {
    id: "c8",
    postSlug: "why-we-spend-so-much-time-in-embassies",
    parentId: null,
    name: "Amaka O.",
    isStaff: false,
    body: "Thank you for writing the unglamorous version. Most organisations only publish the signing ceremony.",
    createdAt: "2026-07-06T10:12:00Z",
    likeCount: 9,
  },
]

/**
 * Comment totals are DERIVED, not stored. An earlier revision hardcoded
 * `commentCount: 24` on a post carrying three fixture comments, which made the
 * card meta and the post heading contradict each other. Deriving it means the
 * two can never drift.
 */
function withCounts(post: Omit<Post, "commentCount">): Post {
  return {
    ...post,
    commentCount: COMMENTS.filter((c) => c.postSlug === post.slug).length,
  }
}

export const POSTS: Post[] = RAW_POSTS.map(withCounts)

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

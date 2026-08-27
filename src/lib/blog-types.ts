// Blog prototype — typed data layer (spec §6).
//
// This is the ONLY data source for the blog. No backend, no fetch, no API
// routes: every later task (cards, index, single post, comments, homepage
// block) reads from `blog-fixtures.ts`, which is typed against these
// interfaces. Swapping fixtures for a real database later changes the data
// source, not the components — as long as the shapes below stay accurate.

/** Drives card treatment: which badge, which layout, whether there's a cover. */
export type PostType = "gallery" | "video" | "story"

/**
 * Fixed union — not a table, not `string`.
 *
 * Re-set 27 August 2026 to the blog-reskin set, which matches how the
 * Foundation's work is actually filed on /gallery. The previous set
 * (mentorship / education / outreach) described programmes rather than the
 * engagements the posts are about.
 */
export type Category = "partnerships" | "governance" | "advocacy" | "summits"

/**
 * Fixed union. No `scheduled` / `publishAt` — scheduling was explicitly
 * decided against for this prototype. A post is either a draft or live.
 */
export type PostStatus = "draft" | "published"

/**
 * A single image or video-poster reference.
 *
 * PROTOTYPE EXTENSION (not in the production spec): `url` is widened to
 * `string | StaticImageData` so fixtures can hand next/image a statically
 * imported `src/Images/*.jpg` — which Next resolves to a `StaticImageData`
 * object, not a URL string — instead of distorting the type by forcing a
 * fake string path. The production version narrows this back to `string`
 * once a real CDN (the plan names Cloudinary) supplies real URLs. Every
 * other field is spec-verbatim.
 */
export interface MediaItem {
  /** `string` once a CDN is wired up; `StaticImageData` for prototype fixtures. */
  url: string | StaticImageDataLike
  /** Required, descriptive alt text (spec §11) — never "image" or "photo". */
  alt: string
  width: number
  height: number
}

/**
 * Structural shape of Next's `StaticImageData`, restated here so this file
 * has no import-time dependency on `next/image`. Assignable from the real
 * type without a cast.
 */
export interface StaticImageDataLike {
  src: string
  height: number
  width: number
  blurDataURL?: string
  blurWidth?: number
  blurHeight?: number
}

/** The six-member body-content union (spec §6). Unknown kinds are skipped by PostBody, never thrown. */
export type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "image"; media: MediaItem; caption?: string }
  | { kind: "gallery"; items: MediaItem[] }
  | { kind: "video"; poster: MediaItem; duration: string; caption?: string }
  | { kind: "quote"; text: string; attribution?: string }

export interface Post {
  slug: string
  title: string
  excerpt: string
  type: PostType
  category: Category
  status: PostStatus
  /** Card/hero image. `null` for `story` posts — spec's "no photos" treatment. */
  cover: MediaItem | null
  author: string
  /** ISO 8601 date string. */
  publishedAt: string
  /** Minutes, for the "N min read" meta line. */
  readTime: number
  /** Gallery posts only — total photo count (e.g. 18), independent of how many are inlined in `blocks`. */
  mediaCount?: number
  /** Video posts only — "m:ss", e.g. "2:41". */
  videoDuration?: string
  tags: string[]
  /** At most one post should be featured at a time — the index hero. */
  featured: boolean
  commentCount: number
  blocks: Block[]
}

/**
 * A single comment. `email` is deliberately absent: spec §6 says it is
 * accepted on create (the comment form) and never returned by a read type.
 * One nesting level only — `parentId` points at a top-level comment, never
 * at another reply.
 */
export interface Comment {
  id: string
  postSlug: string
  parentId: string | null
  name: string
  /** Renders the green "FOUNDATION" badge. */
  isStaff: boolean
  body: string
  /** ISO 8601 date string. */
  createdAt: string
  likeCount: number
}

/** Category metadata for chips/links — order matches the mockup chip row. */
export interface CategoryMeta {
  slug: Category
  label: string
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: "partnerships", label: "Partnerships" },
  { slug: "governance", label: "Governance" },
  { slug: "advocacy", label: "Advocacy" },
  { slug: "summits", label: "Summits" },
]

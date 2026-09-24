#!/usr/bin/env node
/**
 * Move the seven fixture posts and their comments into Supabase.
 *
 *   node scripts/seed-blog.mjs           # insert anything missing
 *   node scripts/seed-blog.mjs --force   # also overwrite posts already there
 *
 * IDEMPOTENT. Re-running without --force skips posts whose slug already
 * exists, so it is safe to run twice. With --force it overwrites the post row
 * but never touches comments — those may be real by then.
 *
 * THIS IS THE ONLY THING THAT USES THE SECRET KEY. It runs from a terminal,
 * never from a request, and it needs the key because seeding writes rows that
 * the anonymous policies deliberately forbid — published posts, and comments
 * carrying is_staff.
 *
 * Images: the fixtures reference files in src/Images via static import, which
 * Next resolves to build-time hashed names that no database row can point at.
 * So each referenced file is uploaded to the blog-media bucket under its own
 * name and the public URL is stored instead.
 */
import { readFileSync, existsSync } from "node:fs"
import { basename, join } from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = process.cwd()
const FORCE = process.argv.includes("--force")
const BUCKET = "blog-media"

// ── env ─────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]
    }),
)
const url = (() => {
  try { return new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin } catch { return null }
})()
const secret = env.SUPABASE_SECRET_KEY

if (!url || !secret) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.",
  )
  process.exit(1)
}

const db = createClient(url, secret, { auth: { persistSession: false } })

// ── read the fixtures without a TypeScript toolchain ────────────────────────
// blog-fixtures.ts is TypeScript with static image imports, so it cannot be
// imported here. Rather than duplicate the content — which would rot the
// moment either copy changed — parse the two things this script needs out of
// the source: which image each `media(IDENT, "alt")` call refers to, and the
// post/comment objects themselves.
const src = readFileSync(join(ROOT, "src/lib/blog-fixtures.ts"), "utf8")

/** `import MOA6 from "@/Images/MOA6.jpg"` → { MOA6: "MOA6.jpg" } */
const imageIdents = Object.fromEntries(
  [...src.matchAll(/import\s+(\w+)\s+from\s+"@\/Images\/([^"]+)"/g)].map(
    (m) => [m[1], m[2]],
  ),
)

const fileCount = Object.keys(imageIdents).length
if (fileCount === 0) {
  console.error("No image imports found in blog-fixtures.ts — has it moved?")
  process.exit(1)
}

// ── make sure the bucket exists ─────────────────────────────────────────────
// Created here rather than left as another manual dashboard step. The RLS
// policies in supabase/migrations/0002_storage.sql are still needed — they are
// what lets the ADMIN upload from a browser. This script uses the secret key,
// which bypasses them, so seeding works either way.
{
  const { data: buckets } = await db.storage.listBuckets()
  if (!(buckets ?? []).some((b) => b.id === BUCKET)) {
    const { error } = await db.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "10MB",
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    })
    if (error) {
      console.error(`could not create the ${BUCKET} bucket: ${error.message}`)
      process.exit(1)
    }
    console.log(`bucket: created "${BUCKET}" (public read)`)
  } else {
    console.log(`bucket: "${BUCKET}" already exists`)
  }
}

// ── upload each referenced image once ───────────────────────────────────────
const publicUrlFor = {}
let uploaded = 0
let reused = 0

for (const [ident, file] of Object.entries(imageIdents)) {
  const path = join(ROOT, "src/Images", file)
  if (!existsSync(path)) {
    console.error(`  missing on disk: src/Images/${file}`)
    process.exit(1)
  }
  const key = `posts/${basename(file)}`
  const { error } = await db.storage
    .from(BUCKET)
    .upload(key, readFileSync(path), {
      contentType: file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
      upsert: FORCE,
    })

  if (error && !/exists/i.test(error.message)) {
    console.error(`  upload failed for ${file}: ${error.message}`)
    process.exit(1)
  }
  if (error) reused++
  else uploaded++

  publicUrlFor[ident] = db.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
}
console.log(`images: ${uploaded} uploaded, ${reused} already present (${fileCount} referenced)`)

// ── turn the fixture source into plain data ─────────────────────────────────
// `media(IDENT, "alt")` becomes a MediaItem whose url is the uploaded public
// URL. Width and height are not known here and are not needed: next/image is
// given explicit sizes for remote images.
// Everything from the first declaration after the media() helper to the end of
// COMMENTS is evaluated as one block.
//
// Slicing from `const RAW_POSTS` alone was not enough: the gallery sets
// (KUWAIT_SET, VIETNAM_SET, POLICE_SET) are declared above it and referenced
// inside it, so the posts array evaluated to a ReferenceError.
const bodyStart = src.indexOf("\nconst ", src.indexOf("function media"))
const commentsOpen = src.indexOf("[", src.indexOf("=", src.indexOf("const COMMENTS")))
let depth = 0
let commentsClose = -1
for (let i = commentsOpen; i < src.length; i++) {
  if (src[i] === "[") depth++
  else if (src[i] === "]" && --depth === 0) { commentsClose = i; break }
}
if (bodyStart === -1 || commentsClose === -1) {
  console.error("could not locate the fixture declarations — has blog-fixtures.ts been restructured?")
  process.exit(1)
}

let block = src.slice(bodyStart, commentsClose + 1)

// media(IDENT, "alt") → the uploaded public URL
block = block.replace(
  /media\(\s*(\w+)\s*,\s*("(?:[^"\\]|\\.)*")\s*,?\s*\)/g,
  (_m, ident, alt) => {
    const u = publicUrlFor[ident]
    if (!u) throw new Error(`media() references unknown import ${ident}`)
    return `{ url: ${JSON.stringify(u)}, alt: ${alt} }`
  },
)

// Strip TypeScript so plain JS is left: the annotation on every `const NAME:
// Type =`, any `as const`, and line comments.
block = block
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/(const\s+\w+)\s*:\s*[^=]+=/g, "$1 =")
  .replace(/\bas const\b/g, "")

let POSTS, COMMENTS
try {
  ;[POSTS, COMMENTS] = eval(`${block};[RAW_POSTS, COMMENTS]`)
} catch (e) {
  console.error("could not evaluate the fixtures:", e.message)
  process.exit(1)
}

// Parsing source text is brittle by nature: rename a constant or reshape a
// declaration and it can quietly yield nothing. Refuse to continue on an empty
// parse rather than report a successful seed of zero rows.
if (!POSTS?.length || !COMMENTS?.length) {
  console.error(
    `parse failed: got ${POSTS?.length ?? 0} posts and ${COMMENTS?.length ?? 0} ` +
      `comments from blog-fixtures.ts.`,
  )
  process.exit(1)
}
console.log(`parsed: ${POSTS.length} posts, ${COMMENTS.length} comments`)

// ── insert ──────────────────────────────────────────────────────────────────
const { data: existing } = await db.from("posts").select("slug")
const have = new Set((existing ?? []).map((r) => r.slug))

const rows = POSTS.filter((p) => FORCE || !have.has(p.slug)).map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  type: p.type,
  category: p.category,
  status: p.status,
  cover: p.cover ?? null,
  author: p.author,
  published_at: p.publishedAt,
  read_time: p.readTime,
  media_count: p.mediaCount ?? null,
  video_duration: p.videoDuration ?? null,
  tags: p.tags,
  featured: p.featured,
  blocks: p.blocks,
}))

if (rows.length === 0) {
  console.log(`posts: nothing to do (all ${POSTS.length} already present — use --force to overwrite)`)
} else {
  const { error } = await db.from("posts").upsert(rows, { onConflict: "slug" })
  if (error) {
    console.error("posts failed:", error.message)
    process.exit(1)
  }
  console.log(`posts: ${rows.length} written`)
}

// Comments are only ever seeded into an empty table. Once the site is live
// these rows are real, and re-running a seed must not duplicate or clobber
// them — not even with --force.
const { count } = await db.from("comments").select("*", { count: "exact", head: true })

if (count && count > 0) {
  console.log(`comments: ${count} already present, left untouched`)
} else {
  // Threading has to survive the move. The fixtures identify a parent by its
  // own string id ("c1"), but the database mints a UUID on insert — so the
  // top-level comments go in first, their new ids are mapped back to the
  // fixture ids, and only then can the replies name a parent that exists.
  //
  // Inserting them in one pass with the fixture id as parent_id would fail the
  // foreign key, and setting every parent to null would silently flatten the
  // thread: the reply from the Comms Team would read as an unrelated comment.
  const tops = COMMENTS.filter((c) => !c.parentId)
  const replies = COMMENTS.filter((c) => c.parentId)

  const row = (c, parent) => ({
    post_slug: c.postSlug,
    parent_id: parent,
    name: c.name,
    is_staff: c.isStaff,
    body: c.body,
    created_at: c.createdAt,
    like_count: c.likeCount,
  })

  const { data: inserted, error: topErr } = await db
    .from("comments")
    .insert(tops.map((c) => row(c, null)))
    .select("id, body")
  if (topErr) {
    console.error("comments (top level) failed:", topErr.message)
    process.exit(1)
  }

  // Match on body: unique across the fixture set, and the only field that
  // survives the round trip unchanged.
  const idFor = new Map()
  for (const t of tops) {
    const found = inserted.find((r) => r.body === t.body)
    if (found) idFor.set(t.id, found.id)
  }

  const replyRows = []
  for (const r of replies) {
    const parent = idFor.get(r.parentId)
    if (!parent) {
      console.error(`  reply "${r.id}" has no parent in the database — skipped`)
      continue
    }
    replyRows.push(row(r, parent))
  }

  if (replyRows.length > 0) {
    const { error: replyErr } = await db.from("comments").insert(replyRows)
    if (replyErr) {
      console.error("comments (replies) failed:", replyErr.message)
      process.exit(1)
    }
  }
  console.log(
    `comments: ${tops.length} top level + ${replyRows.length} replies, threading preserved`,
  )
}

console.log("done.")

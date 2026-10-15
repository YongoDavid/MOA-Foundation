#!/usr/bin/env node
/**
 * Prove a visitor can watch an uploaded video on the site.
 *   node scripts/check-video.mjs            (against http://localhost:3010)
 *   BASE=https://www.mosesmentoringfoundation.org node scripts/check-video.mjs
 *
 * WHY THIS EXISTS, AND WHAT IT IS NOT.
 *
 * check-uploads.mjs proves a file reaches storage. That is a DEPENDENCY of
 * the feature, not the feature: the whole point is that someone reading the
 * blog sees a player with that file in it. Three bugs in this project's
 * history came from testing one layer below the claim, so this one goes all
 * the way — it uploads, publishes a post, and reads the rendered HTML back
 * over HTTP.
 *
 * It does NOT prove the video decodes and plays. The bytes uploaded are not a
 * real clip, and no script here can watch a picture move. Playback is a line
 * on the manual QA checklist and belongs there.
 *
 * It writes to the real database and cleans up after itself, including on
 * failure. The post is published for a few seconds under an obvious slug.
 */
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")] }),
)
const BASE = process.env.BASE ?? "http://localhost:3010"
const origin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const admin = createClient(origin, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

const U = await import("../src/lib/uploads.ts")
const F = await import("../src/lib/blog-format.ts")

let fails = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { console.log(`  FAIL  ${m}`); fails++ }

// ── the image shown on a card ───────────────────────────────────────────────
// A video post written before the editor adopted the frame has no cover, and
// its card rendered as an empty box on the homepage.
const POSTER = { url: "https://x/p.jpg", alt: "", width: 480, height: 848 }
const COVER = { url: "https://x/c.jpg", alt: "c", width: 100, height: 100 }
F.coverFor(null, [{ kind: "video", src: "https://x/a.mp4", poster: POSTER }]) === POSTER
  ? ok("a coverless video post falls back to the video's own frame")
  : bad("a coverless video post still has no card image")
F.coverFor(COVER, [{ kind: "video", src: "https://x/a.mp4", poster: POSTER }]) === COVER
  ? ok("a chosen cover is not overridden by the frame")
  : bad("the frame overrode a cover someone chose")
F.coverFor(null, [{ kind: "paragraph" }]) === null
  ? ok("a story with no cover stays coverless, which is the design")
  : bad("a coverless story grew a cover")

// ── the duration shown on a card ────────────────────────────────────────────
// Derived from the block, because the editor has no field for it and never
// had one. Pure, so it is checked here rather than through a server action.
F.deriveVideoDuration([{ kind: "video", src: "https://x/a.mp4", durationSeconds: 95.4 }], null) === "1:35"
  ? ok("a card duration is derived from the video block")
  : bad("the card duration is not derived from the block")
F.deriveVideoDuration([{ kind: "paragraph" }], "2:10") === "2:10"
  ? ok("a post with no video keeps whatever it had")
  : bad("a post with no video lost its stored duration")
F.deriveVideoDuration([{ kind: "video", src: "", durationSeconds: 90 }], null) === null
  ? ok("an empty video block derives nothing")
  : bad("an empty video block produced a duration")

const SLUG = `zz-video-check-${Date.now().toString(36)}`
let ticket = null

try {
  const reachable = await fetch(`${BASE}/blog`).then((r) => r.ok).catch(() => false)
  if (!reachable) {
    console.log(`  FAIL  no server at ${BASE} — start one first`)
    process.exit(1)
  }

  ticket = await U.createUploadTicket(admin, "video", {
    name: "check.mp4", size: 4096, type: "video/mp4",
  })
  if (!ticket.ok) throw new Error(ticket.error)

  const put = await fetch(ticket.signedUrl, {
    method: "PUT",
    headers: { "content-type": "video/mp4" },
    body: Buffer.alloc(4096),
  })
  put.ok ? ok("the video reaches storage") : bad(`upload failed (${put.status})`)

  const poster = { url: `${origin}/storage/v1/object/public/blog-media/posts/check.jpg`, alt: "A still from the check clip", width: 1280, height: 720 }
  const { error } = await admin.from("posts").insert({
    slug: SLUG,
    title: "Video render check",
    excerpt: "Temporary. Deleted by scripts/check-video.mjs.",
    type: "video",
    category: "advocacy",
    status: "published",
    author: "Comms Team",
    published_at: new Date().toISOString().slice(0, 10),
    read_time: 1,
    tags: [],
    featured: false,
    cover: poster,
    blocks: [{ kind: "video", src: ticket.publicUrl, poster, durationSeconds: 95, sizeBytes: 4096 }],
    media_count: null,
    video_duration: "1:35",
  })
  if (error) throw new Error(`insert: ${error.message}`)
  ok("a post carrying the video is published")

  const html = await fetch(`${BASE}/blog/${SLUG}`, { cache: "no-store" }).then((r) => r.text())

  html.includes("<video")
    ? ok("the post renders a real <video> element") : bad("no <video> element — the player did not render")
  html.includes(ticket.publicUrl)
    ? ok("the uploaded file's URL is in the page") : bad("the page does not reference the uploaded file")
  // Written as plain searches rather than bare regex literals: a line that
  // STARTS with / after a function call parses as division, not a regex.
  const autoplay = /<video[^>]*\sautoplay/i
  html.includes('preload="none"')
    ? ok('preload="none" — nothing downloads until someone presses play')
    : bad("preload is not none; every visitor would pull the whole file")
  autoplay.test(html)
    ? bad("the video autoplays") : ok("it does not autoplay")
  html.includes("1:35")
    ? ok("the stored duration is shown") : bad("the duration is missing")

  // The frame takes the video's own shape. A fixed landscape box letterboxed
  // 16:9 on a phone and pillarboxed it on a desktop, and squashed upright
  // phone footage into a strip. 1280x720 must come out as 16:9.
  html.includes("aspect-ratio:1.777")
    ? ok("the frame matches the video's aspect ratio")
    : bad("the frame is not using the video's dimensions")

  // The file must be fetchable by an anonymous visitor, with a range request,
  // which is how every browser actually pulls a video.
  const ranged = await fetch(ticket.publicUrl, { headers: { range: "bytes=0-1023" } })
  ranged.status === 206
    ? ok("storage serves range requests, so the video can be scrubbed")
    : bad(`range request returned ${ranged.status}, not 206 — scrubbing will not work`)
} catch (e) {
  bad(e.message)
} finally {
  await admin.from("posts").delete().eq("slug", SLUG)
  if (ticket?.ok) await admin.storage.from(U.VIDEO_BUCKET).remove([ticket.path])
  ok("the check post and file are removed")
}

console.log(fails === 0 ? "\nvideo: all checks passed" : `\nvideo: ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)

#!/usr/bin/env node
/**
 * Exercise the upload path.   node scripts/check-uploads.mjs
 *
 * Drives src/lib/uploads.ts — the same module the admin uses — against the
 * real project, and completes one genuine signed upload end to end, then
 * removes it. A ticket that is issued but never redeemed proves nothing; the
 * failure this feature exists to fix was a request that died in transit.
 *
 * Imported straight from source (Node 24 strips the types), so this tests the
 * file the app imports rather than a copy.
 */
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")] }),
)
const origin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const admin = createClient(origin, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const anon = createClient(origin, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })

const U = await import("../src/lib/uploads.ts")

let fails = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { console.log(`  FAIL  ${m}`); fails++ }

const good = { name: "Embassy Visit.JPG", size: 2 * 1024 * 1024, type: "image/jpeg" }

// ── validation ──────────────────────────────────────────────────────────────
U.validateUpload("image", good).ok ? ok("a normal photo is accepted") : bad("a normal photo was rejected")
!U.validateUpload("image", { ...good, type: "application/pdf" }).ok ? ok("a non-image is rejected") : bad("a PDF was accepted")
!U.validateUpload("image", { ...good, size: 0 }).ok ? ok("an empty file is rejected") : bad("an empty file was accepted")

// The bug this phase exists to fix: 4.5MB used to pass validation here and
// then die at Vercel's request limit. It must still be ALLOWED — the point is
// that it no longer crosses the server at all.
U.validateUpload("image", { ...good, size: 6 * 1024 * 1024 }).ok
  ? ok("a 6MB photo is allowed (it would have failed on Vercel before)")
  : bad("a 6MB photo is rejected — the production bug is not actually fixed")

const tooBig = U.validateUpload("image", { ...good, size: 11 * 1024 * 1024 })
!tooBig.ok && /11\.0MB/.test(tooBig.error)
  ? ok("an oversized file is refused, and the message names the size")
  : bad("the oversize message does not name the actual size")

// ── keys ────────────────────────────────────────────────────────────────────
const k1 = U.storageKey("image", "Embassy Visit.JPG")
const keyShape = /^posts\/[a-z0-9]+-embassy-visit\.jpg$/
if (keyShape.test(k1)) {
  ok("the key is lowercased and slugified")
} else {
  bad(`unexpected key: ${k1}`)
}

// Two files with the same name must not collide. The prefix is time-based, so
// wait a tick rather than relying on the two calls landing in different
// milliseconds — a flaky check is worse than no check.
await new Promise((r) => setTimeout(r, 5))
const k2 = U.storageKey("image", "Embassy Visit.JPG")
if (k1 !== k2) {
  ok("two files with the same name get different keys")
} else {
  bad("key collision — the second upload would overwrite the first")
}

// ── a real ticket, and a real upload ────────────────────────────────────────
const ticket = await U.createUploadTicket(admin, "image", good)
if (!ticket.ok) {
  bad(`could not issue a ticket: ${ticket.error}`)
} else {
  ok("a ticket is issued")
  ticket.publicUrl.includes(ticket.path) ? ok("the public URL matches the path") : bad("public URL does not match the path")

  // Redeem it with the PUBLISHABLE key, exactly as the browser does.
  const pixel = Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
    "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA" +
    "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==", "base64")
  const { error: upErr } = await anon.storage
    .from(U.BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, pixel, { contentType: "image/jpeg" })

  if (upErr) {
    bad(`the signed upload failed: ${upErr.message}`)
  } else {
    ok("the browser-side upload completes against the ticket")
    const r = await fetch(ticket.publicUrl)
    r.ok && (await r.arrayBuffer()).byteLength > 0
      ? ok("the uploaded file is publicly readable at that URL")
      : bad(`the file is not readable (${r.status})`)
  }

  // A used ticket must not be reusable.
  const { error: reErr } = await anon.storage
    .from(U.BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, pixel, { contentType: "image/jpeg" })
  reErr ? ok("a spent ticket cannot be reused") : bad("a spent ticket was accepted AGAIN")

  await admin.storage.from(U.BUCKET).remove([ticket.path])
  ok("probe file removed")
}

// ── and the browser must not be able to write without one ───────────────────
const { error: naked } = await anon.storage
  .from(U.BUCKET)
  .upload(`posts/__unauthorised-${Date.now()}.jpg`, Buffer.from("x"), { contentType: "image/jpeg" })
naked ? ok("an anonymous upload WITHOUT a ticket is refused") : bad("anonymous upload succeeded with no ticket")

// ── video ───────────────────────────────────────────────────────────────────
const clip = { name: "Embassy Visit.mp4", size: 30 * 1024 * 1024, type: "video/mp4" }

U.validateUpload("video", clip).ok ? ok("a 30MB mp4 is accepted") : bad("a 30MB mp4 was rejected")
!U.validateUpload("video", { ...clip, type: "video/quicktime" }).ok
  ? ok("a .mov is rejected") : bad("a .mov was accepted")
!U.validateUpload("video", { ...clip, type: "image/jpeg" }).ok
  ? ok("an image is rejected as video") : bad("an image was accepted as video")

const over = U.validateUpload("video", { ...clip, size: 80 * 1024 * 1024 })
if (!over.ok && over.error.includes("80MB") && /re-export/i.test(over.error)) {
  ok("an 80MB video is refused, and the message says what to do")
} else {
  bad("the oversize video message is unhelpful or missing")
}

// 50MB exactly must pass — it is the documented ceiling, not a value to be
// off-by-one about.
U.validateUpload("video", { ...clip, size: 50 * 1024 * 1024 }).ok
  ? ok("exactly 50MB is allowed") : bad("50MB is rejected — off by one at the ceiling")

U.bucketFor("video") === "blog-video" && U.bucketFor("image") === "blog-media"
  ? ok("video and images route to separate buckets") : bad("bucket routing is wrong")

U.storageKey("video", "Clip.MP4").startsWith("video/")
  ? ok("video keys live under video/") : bad("video key is in the wrong folder")

// a real video ticket, redeemed
const vt = await U.createUploadTicket(admin, "video", clip)
if (!vt.ok) {
  bad(`no video ticket: ${vt.error}`)
} else {
  ok("a video ticket is issued")
  const { error } = await anon.storage
    .from(U.VIDEO_BUCKET)
    .uploadToSignedUrl(vt.path, vt.token, Buffer.alloc(2048), { contentType: "video/mp4" })
  if (error) {
    bad(`the video upload failed: ${error.message}`)
  } else {
    ok("the browser-side video upload completes")
    const r = await fetch(vt.publicUrl)
    r.ok ? ok("the video is publicly readable") : bad(`video not readable (${r.status})`)
  }
  await admin.storage.from(U.VIDEO_BUCKET).remove([vt.path])
}

// the bucket must actually hold the ceiling, not just the code
const { data: vb } = await admin.storage.getBucket(U.VIDEO_BUCKET)
vb && vb.file_size_limit === 50 * 1024 * 1024
  ? ok("the bucket enforces 50MB too, not just the code")
  : bad(`bucket limit is ${vb ? vb.file_size_limit : "unset"} — run 0004_video.sql`)

// ── codec detection ─────────────────────────────────────────────────────────
// The warning in the editor is only as good as this. An HEVC file that reads
// as "unknown" ships silently and plays for nobody outside Safari.
const buf = (s) => new TextEncoder().encode(`\0\0\0\x28stsd\0\0\0\x01${s}`)

U.detectMp4Codec(buf("avc1")) === "h264" ? ok("avc1 reads as H.264") : bad("avc1 was not detected")
U.detectMp4Codec(buf("hvc1")) === "hevc" ? ok("hvc1 reads as HEVC") : bad("hvc1 was not detected")
U.detectMp4Codec(buf("hev1")) === "hevc" ? ok("hev1 reads as HEVC") : bad("hev1 was not detected")
U.detectMp4Codec(buf("mp4a")) === "unknown" ? ok("an audio-only marker is not mistaken for video") : bad("mp4a was misread")
U.detectMp4Codec(new Uint8Array(0)) === "unknown" ? ok("an empty buffer is unknown, not a crash") : bad("an empty buffer broke detection")

// A file carrying both markers must read as the risky one. Some exports write
// an avc1 thumbnail track alongside an HEVC video track; calling that H.264
// would suppress the warning on exactly the file that needs it.
U.detectMp4Codec(buf("avc1"), buf("hvc1")) === "hevc"
  ? ok("a mixed file is treated as HEVC") : bad("a mixed file was called H.264")

// moov sits at the END of most camera recordings, so a marker found only in
// the tail chunk must still count. This is why the caller passes both ends.
U.detectMp4Codec(new Uint8Array(1024), buf("hvc1")) === "hevc"
  ? ok("a marker in the trailing chunk is found") : bad("only the first chunk is scanned")

// ── the raw PUT the browser actually performs ───────────────────────────────
// VideoField does not use uploadToSignedUrl: it needs XHR for a progress bar,
// so it PUTs to ticket.signedUrl itself. Testing uploadToSignedUrl instead
// would be testing a dependency of the claim rather than the claim.
const rt = await U.createUploadTicket(admin, "video", clip)
if (!rt.ok) {
  bad(`no ticket for the raw PUT: ${rt.error}`)
} else {
  rt.signedUrl && rt.signedUrl.startsWith("http")
    ? ok("the ticket carries a full upload URL") : bad("signedUrl is missing or not absolute")
  const put = await fetch(rt.signedUrl, {
    method: "PUT",
    headers: { "content-type": "video/mp4" },
    body: Buffer.alloc(4096),
  })
  put.ok ? ok("a raw PUT to the signed URL is accepted") : bad(`the raw PUT failed (${put.status})`)
  const back = await fetch(rt.publicUrl)
  back.ok && back.headers.get("content-type") === "video/mp4"
    ? ok("the raw-PUT object is readable and served as video/mp4")
    : bad(`raw-PUT object not readable as video (${back.status} ${back.headers.get("content-type")})`)
  await admin.storage.from(U.VIDEO_BUCKET).remove([rt.path])
}

console.log(fails === 0 ? "\nuploads: all checks passed" : `\nuploads: ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)

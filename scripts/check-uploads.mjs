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

console.log(fails === 0 ? "\nuploads: all checks passed" : `\nuploads: ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)

#!/usr/bin/env node
/**
 * Exercise the comment path the site actually uses:  node scripts/check-comments.mjs
 *
 * WHY THIS EXISTS. Commenting shipped broken. The check that was run at the
 * time inserted a row with the anonymous Supabase client, saw it appear, and
 * called the feature working — but the form never reached that code. The
 * database was fine; the wiring was not. Testing the layer below the bug
 * proves nothing about the bug.
 *
 * So the accept/reject logic was moved into src/lib/comments.ts, free of any
 * Next dependency, and this drives THAT — the same function the server action
 * calls — against the real project.
 *
 * What it still cannot reach: the browser handing FormData to the action.
 * That is the one step left for a human.
 */
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"
import { createRequire } from "node:module"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")] }),
)
const origin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
const anon = createClient(origin, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
const admin = createClient(origin, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

// Imported DIRECTLY from source. Node 24 strips TypeScript types natively, so
// this is the very module the app imports — not a copy, and not a re-parse
// that could drift from it. An earlier version of this script hand-stripped
// the types with regexes and choked on the first return-type annotation.
const mod = await import("../src/lib/comments.ts")

let fails = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { console.log(`  FAIL  ${m}`); fails++ }

const slug = (await admin.from("posts").select("slug").eq("status", "published").limit(1)).data[0].slug
const base = { postSlug: slug, name: "__check", body: "a comment from the check script" }

// validation
!mod.validateComment({ ...base, name: "" }).ok ? ok("empty name rejected") : bad("empty name accepted")
!mod.validateComment({ ...base, body: "" }).ok ? ok("empty body rejected") : bad("empty body accepted")
!mod.validateComment({ ...base, body: "x".repeat(mod.MAX_BODY + 1) }).ok ? ok("over-long body rejected") : bad("over-long body accepted")
!mod.validateComment({ ...base, email: "nope" }).ok ? ok("malformed email rejected") : bad("malformed email accepted")
mod.validateComment({ ...base, trap: "bot" }).drop === true ? ok("honeypot drops silently") : bad("honeypot not honoured")
mod.validateComment(base).ok ? ok("a good comment validates") : bad("a good comment was rejected")

// the real insert, through the same function the action calls
const r = await mod.insertComment(anon, base)
r.ok ? ok("insertComment writes a top-level comment") : bad(`insertComment failed: ${r.error}`)
const top = (await admin.from("comments").select("id").eq("name", "__check").maybeSingle()).data
top ? ok("the row is in the database") : bad("no row was written")

// a reply, which is what the Reply button does
if (top) {
  const rr = await mod.insertComment(anon, { ...base, name: "__checkreply", body: "a reply", parentId: top.id })
  rr.ok ? ok("insertComment writes a reply") : bad(`reply failed: ${rr.error}`)
  const rep = (await admin.from("comments").select("parent_id").eq("name", "__checkreply").maybeSingle()).data
  rep?.parent_id === top.id ? ok("the reply is attached to its parent") : bad("the reply lost its parent")
}

// the honeypot must write nothing at all
await mod.insertComment(anon, { ...base, name: "__checktrap", trap: "http://spam" })
;((await admin.from("comments").select("id").eq("name", "__checktrap")).data ?? []).length === 0
  ? ok("a honeypot submission writes no row")
  : bad("a honeypot submission WROTE a row")

await admin.from("comments").delete().in("name", ["__check", "__checkreply", "__checktrap"])
console.log(fails === 0 ? "\ncomments: all checks passed" : `\ncomments: ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)

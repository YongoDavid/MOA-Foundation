#!/usr/bin/env node
/**
 * Prove the row-level security policies actually hold. Run after ANY change to
 * supabase/migrations/*.sql:  node scripts/check-rls.mjs
 *
 * RLS is the real security boundary for this site — the publishable key is in
 * the browser bundle by design, so a policy is the only thing standing between
 * a stranger and the posts table. A redirect in proxy.ts is convenience.
 *
 * READ THIS BEFORE ADDING A CHECK. PostgREST returns NO ERROR when an update
 * or delete simply matches zero rows, because the SELECT policy hid them. So
 * "no error" does not mean "the write succeeded", and an earlier version of
 * this check reported a policy hole that did not exist. Every write probe here
 * therefore VERIFIES THE EFFECT — it reads the row back and compares — rather
 * than trusting the absence of an error.
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

let failures = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { console.log(`  FAIL  ${m}`); failures++ }

const DRAFT = "__rls-draft-probe"
const target = (await admin.from("posts").select("slug,title").eq("status", "published").limit(1)).data?.[0]
if (!target) { console.error("no published post to probe against — seed first"); process.exit(1) }

await admin.from("posts").delete().eq("slug", DRAFT)
await admin.from("posts").insert({ slug: DRAFT, title: "probe", category: "partnerships", status: "draft", blocks: [] })

// 1. drafts are invisible
;((await anon.from("posts").select("slug").eq("slug", DRAFT)).data ?? []).length === 0
  ? ok("anonymous cannot see a draft")
  : bad("anonymous CAN see a draft")

// 2. published are visible
;((await anon.from("posts").select("slug").eq("status", "published")).data ?? []).length > 0
  ? ok("anonymous can read published posts")
  : bad("anonymous cannot read published posts")

// 3. no anonymous edit — verified by EFFECT, not by error
await anon.from("posts").update({ title: "DEFACED" }).eq("slug", target.slug)
;(await admin.from("posts").select("title").eq("slug", target.slug).single()).data.title === target.title
  ? ok("anonymous cannot edit a published post")
  : bad("anonymous EDITED a published post")

// 4. no anonymous insert
await anon.from("posts").insert({ slug: "__anon-insert", title: "x", category: "partnerships", status: "published", blocks: [] })
;((await admin.from("posts").select("slug").eq("slug", "__anon-insert")).data ?? []).length === 0
  ? ok("anonymous cannot create a post")
  : bad("anonymous CREATED a post")

// 5. no anonymous delete
await anon.from("posts").delete().eq("slug", target.slug)
;((await admin.from("posts").select("slug").eq("slug", target.slug)).data ?? []).length === 1
  ? ok("anonymous cannot delete a post")
  : bad("anonymous DELETED a post")

// 6. nobody can wear the FOUNDATION badge without signing in
await anon.from("comments").insert({ post_slug: target.slug, name: "Impostor", body: "pretending", is_staff: true })
;((await admin.from("comments").select("id").eq("name", "Impostor")).data ?? []).length === 0
  ? ok("anonymous cannot post as the Foundation")
  : bad("anonymous POSTED as the Foundation")

// 7. ...but an ordinary comment must work. Immediate publication is the
//    client's decision; if this breaks, commenting is broken for everyone.
await anon.from("comments").insert({ post_slug: target.slug, name: "__probe", body: "an ordinary visitor comment" })
;((await admin.from("comments").select("id").eq("name", "__probe")).data ?? []).length === 1
  ? ok("anonymous CAN post an ordinary comment")
  : bad("anonymous cannot comment — commenting is broken")

// 8. commenting on a draft is refused
await anon.from("comments").insert({ post_slug: DRAFT, name: "__probe2", body: "on a draft" })
;((await admin.from("comments").select("id").eq("name", "__probe2")).data ?? []).length === 0
  ? ok("anonymous cannot comment on a draft")
  : bad("anonymous COMMENTED on a draft")

await admin.from("comments").delete().in("name", ["__probe", "__probe2", "Impostor"])
await admin.from("posts").delete().in("slug", [DRAFT, "__anon-insert"])

console.log(failures === 0 ? "\nRLS: all checks passed" : `\nRLS: ${failures} FAILED`)
process.exit(failures === 0 ? 0 : 1)

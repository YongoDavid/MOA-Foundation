#!/usr/bin/env node
/**
 * Exercise the form delivery path.   node scripts/check-forms.mjs
 *                                    node scripts/check-forms.mjs --send
 *
 * By default it drives src/lib/mail.ts — the same module the server action
 * calls — with a FAKE mailer, so validation, the honeypot and the email body
 * are all checked without sending anything.
 *
 * --send additionally puts ONE real email through Resend, to the configured
 * FORMS_TO. That is the only way to know the API key, the verified domain and
 * the From address actually agree; everything short of it is inference.
 *
 * The module is imported straight from source — Node 24 strips the types — so
 * this tests the file the app imports, not a copy of it.
 */
import { readFileSync } from "node:fs"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")] }),
)
const { validateForm, buildEmail, sendFormEmail } = await import("../src/lib/mail.ts")

let fails = 0
const ok = (m) => console.log(`  ok    ${m}`)
const bad = (m) => { console.log(`  FAIL  ${m}`); fails++ }

// ── a mailer that records instead of sending ────────────────────────────────
const sent = []
const fake = { emails: { send: async (o) => { sent.push(o); return { error: null } } } }
const route = { from: env.RESEND_FROM, to: env.FORMS_TO }

const CONTACT = { subject: "Mentoring", name: "Test Person", email: "t@example.org", message: "Hello there." }

// ── validation ──────────────────────────────────────────────────────────────
validateForm("contact", CONTACT).ok ? ok("a complete contact form validates") : bad("a complete contact form was rejected")
!validateForm("contact", { ...CONTACT, name: "" }).ok ? ok("a missing required field is rejected") : bad("a missing required field passed")
!validateForm("contact", { ...CONTACT, email: "nope" }).ok ? ok("a malformed email is rejected") : bad("a malformed email passed")
validateForm("contact", { ...CONTACT, website: "bot" }).drop ? ok("the honeypot drops silently") : bad("the honeypot is not honoured")
!validateForm("mentee", { name: "x" }).ok ? ok("mentee requires its own fields") : bad("mentee accepted an empty form")
validateForm("newsletter", { email: "a@b.co" }).ok ? ok("newsletter needs only an email") : bad("newsletter rejected a valid email")

// ── the email body ──────────────────────────────────────────────────────────
const built = buildEmail("contact", CONTACT)
built.subject.includes("Test Person") ? ok("the subject names the sender") : bad("the subject does not name the sender")
built.text.includes("Hello there.") ? ok("the body carries the message") : bad("the body lost the message")
built.replyTo === "t@example.org"
  ? ok("Reply-To is the SUBMITTER, so Reply reaches them")
  : bad(`Reply-To is ${built.replyTo}, not the submitter`)

// ── send, against the fake ──────────────────────────────────────────────────
const r = await sendFormEmail(fake, route, "contact", CONTACT)
r.ok && sent.length === 1 ? ok("a valid submission is handed to the mailer") : bad("nothing reached the mailer")
sent[0]?.to?.[0] === env.FORMS_TO ? ok(`addressed to ${env.FORMS_TO}`) : bad("addressed to the wrong recipient")

const before = sent.length
await sendFormEmail(fake, route, "contact", { ...CONTACT, website: "bot" })
sent.length === before ? ok("a honeypot submission is never sent") : bad("a honeypot submission WAS sent")

// ── configuration ───────────────────────────────────────────────────────────
const domain = "mosesmentoringfoundation.org"
;(env.RESEND_FROM ?? "").includes(domain)
  ? ok("the From address is on the verified domain")
  : bad(`From is ${env.RESEND_FROM} — not on ${domain}, so Resend will reject it`)

// ── the real thing ──────────────────────────────────────────────────────────
if (process.argv.includes("--send")) {
  if (!env.RESEND_API_KEY) {
    bad("RESEND_API_KEY is not in .env.local — cannot perform a real send")
    console.log("        The key may be set in Vercel, which covers production but")
    console.log("        not local development. Add it to .env.local as well.")
    console.log(fails === 1 ? "\nforms: everything but the live send passed" : `\nforms: ${fails} FAILED`)
    process.exit(1)
  }
  const { Resend } = await import("resend")
  const live = await sendFormEmail(
    new Resend(env.RESEND_API_KEY), route, "contact",
    { subject: "Something else", name: "Delivery check",
      email: env.FORMS_TO, message: "Automated check from scripts/check-forms.mjs. Safe to delete." },
  )
  live.ok ? ok(`a REAL email was accepted by Resend for ${env.FORMS_TO}`) : bad(`real send failed: ${live.error}`)
} else {
  console.log("  --    real send skipped (pass --send to actually deliver one)")
}

console.log(fails === 0 ? "\nforms: all checks passed" : `\nforms: ${fails} FAILED`)
process.exit(fails === 0 ? 0 : 1)

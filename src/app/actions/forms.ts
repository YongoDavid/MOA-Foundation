"use server"

import { Resend } from "resend"
import { sendFormEmail, type FormKind, type Fields } from "@/lib/mail"

export type FormState = { error?: string; ok?: boolean }

/**
 * Deliver one form submission by email.
 *
 * A thin wrapper. Validation, the email body and the send all live in
 * src/lib/mail.ts, which has no Next dependency and is exercised by
 * scripts/check-forms.mjs. This file only reads configuration, applies the
 * rate limit and hands over.
 */

/**
 * Crude per-instance rate limit.
 *
 * BE CLEAR ABOUT WHAT THIS IS. Serverless functions scale out, and each
 * instance has its own memory, so a determined flood spread across instances
 * gets through. It is here to stop the ordinary case — one script hammering
 * one endpoint — not a distributed attack. If real abuse appears, this wants
 * replacing with a shared store (Upstash Redis has a free tier); until then a
 * dependency and a bill for a low-traffic charity site is not worth it.
 */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const seen = new Map<string, number[]>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const hits = (seen.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  seen.set(key, hits)
  // Keep the map from growing without bound on a long-lived instance.
  if (seen.size > 500) {
    for (const [k, v] of seen) if (v.every((t) => now - t > WINDOW_MS)) seen.delete(k)
  }
  return hits.length > MAX_PER_WINDOW
}

export async function submitForm(
  kind: FormKind,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const to = process.env.FORMS_TO

  if (!apiKey || !from || !to) {
    console.error("[submitForm] missing RESEND_API_KEY / RESEND_FROM / FORMS_TO")
    return {
      error:
        "This form is not connected yet. Please email mosesofafrica@gmail.com instead.",
    }
  }

  const fields: Fields = {}
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") fields[k] = v
  }

  // Keyed on the email given, not an IP: a server action does not hand us the
  // client address, and the email is what identifies a repeat submitter here.
  // Trivially spoofable — see the note on the limiter above.
  if (rateLimited(`${kind}:${(fields.email ?? "").trim().toLowerCase()}`)) {
    return { error: "That is a lot of submissions at once. Please try again in a minute." }
  }

  const resend = new Resend(apiKey)
  const res = await sendFormEmail(resend, { from, to }, kind, fields)
  return res.ok ? { ok: true } : { error: res.error }
}

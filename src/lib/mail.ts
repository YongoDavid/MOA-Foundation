/**
 * Building and sending the form notifications.
 *
 * NO next/* IMPORTS, deliberately. The same rule as src/lib/comments.ts: logic
 * that only runs behind a Next-only import can only be tested through a
 * browser, and this project has already shipped a broken form that way. Every
 * decision about what is valid, what the email says and whether it sent lives
 * here, where scripts/check-forms.mjs can drive it.
 */

export type FormKind = "mentee" | "mentor" | "donate" | "contact" | "newsletter"

export type Fields = Record<string, string>

const LABELS: Record<FormKind, string> = {
  mentee: "Mentee application",
  mentor: "Mentor enquiry",
  donate: "Donation enquiry",
  contact: "Contact form",
  newsletter: "Newsletter signup",
}

/** Fields that must be present and non-empty, per form. */
const REQUIRED: Record<FormKind, string[]> = {
  mentee: ["name", "email", "country", "motivation", "consent"],
  mentor: ["name", "email", "country", "field", "availability", "motivation", "consent"],
  donate: ["name", "email", "designation"],
  contact: ["subject", "name", "email", "message"],
  newsletter: ["email"],
}

/** Order the email in, so the team reads the useful bits first. */
const ORDER: Record<FormKind, string[]> = {
  mentee: ["name", "age", "email", "phone", "country", "city", "programme", "motivation", "referral", "consent"],
  mentor: ["name", "email", "country", "field", "availability", "motivation", "consent"],
  donate: ["name", "email", "phone", "designation", "note"],
  contact: ["subject", "name", "email", "phone", "country", "message"],
  newsletter: ["email"],
}

const PRETTY: Record<string, string> = {
  name: "Name", age: "Age", email: "Email", phone: "Phone", country: "Country",
  city: "City", programme: "Programme", motivation: "Motivation",
  referral: "How they heard about us", consent: "Consent given",
  field: "Field of work", availability: "Availability",
  designation: "Wants to support", note: "Note", subject: "About",
  message: "Message",
}

export const MAX_FIELD = 4000

export type Validation = { ok: true; drop: boolean } | { ok: false; error: string }

/**
 * Server-side validation. The forms validate in the browser too, for the
 * error messages — but that runs on the client and a client can be bypassed,
 * so nothing here trusts it.
 */
export function validateForm(kind: FormKind, fields: Fields): Validation {
  // Honeypot. Invisible to a person, irresistible to a bot. Report success so
  // the bot does not learn to leave it alone.
  if ((fields.website ?? "").trim()) return { ok: true, drop: true }

  for (const key of REQUIRED[kind]) {
    if (!(fields[key] ?? "").trim()) {
      return { ok: false, error: "Please fill in every required field." }
    }
  }
  const email = (fields.email ?? "").trim()
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." }
  }
  for (const [k, v] of Object.entries(fields)) {
    if ((v ?? "").length > MAX_FIELD) {
      return { ok: false, error: `${PRETTY[k] ?? k} is too long.` }
    }
  }
  return { ok: true, drop: false }
}

export function buildEmail(kind: FormKind, fields: Fields) {
  const who = (fields.name ?? fields.email ?? "someone").trim()
  const lines: string[] = []
  for (const key of ORDER[kind]) {
    const v = (fields[key] ?? "").trim()
    if (!v) continue
    lines.push(`${PRETTY[key] ?? key}: ${v}`)
  }

  return {
    subject: `${LABELS[kind]} — ${who}`,
    text:
      `${LABELS[kind]}\n` +
      `${"=".repeat(LABELS[kind].length)}\n\n` +
      lines.join("\n") +
      `\n\n—\nSent from the website. Reply to this email to answer ${who} directly.`,
    // Replying goes to the PERSON, not back to the Foundation's own inbox.
    // Without this the team would hit Reply and write to themselves.
    replyTo: (fields.email ?? "").trim() || undefined,
  }
}

export type SendResult = { ok: true; skipped?: boolean } | { ok: false; error: string }

/** Minimal shape of the Resend client, so a test can pass a fake. */
export type Mailer = {
  emails: {
    send: (o: {
      from: string
      to: string[]
      subject: string
      text: string
      replyTo?: string
    }) => Promise<{ error: { message: string } | null }>
  }
}

export async function sendFormEmail(
  mailer: Mailer,
  route: { from: string; to: string },
  kind: FormKind,
  fields: Fields,
): Promise<SendResult> {
  const v = validateForm(kind, fields)
  if (!v.ok) return { ok: false, error: v.error }
  if (v.drop) return { ok: true, skipped: true }

  const { subject, text, replyTo } = buildEmail(kind, fields)
  const { error } = await mailer.emails.send({
    from: route.from,
    to: [route.to],
    subject,
    text,
    replyTo,
  })

  if (error) {
    console.error("[sendFormEmail]", kind, error.message)
    return { ok: false, error: "We could not send that just now. Please try again, or email us directly." }
  }
  return { ok: true }
}

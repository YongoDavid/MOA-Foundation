import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Comment validation and insertion, with NO Next.js dependency.
 *
 * Split out of the server action deliberately. The action imports
 * next/headers, which makes it unreachable from a plain Node script — so the
 * only way to exercise it was through a browser, and a bug in this path
 * shipped because the check that was run tested the database directly and
 * declared the feature working. The logic that actually decides whether a
 * comment is accepted now lives here, where scripts/check-comments.mjs can
 * drive it against the real project.
 */

export const MAX_BODY = 2000
export const MAX_NAME = 80

export type CommentInput = {
  postSlug: string
  name: string
  body: string
  email?: string
  parentId?: string | null
  /** Honeypot. A person leaves it empty; a bot fills every field it finds. */
  trap?: string
}

export type Validated =
  | { ok: true; drop: boolean; value: Required<Omit<CommentInput, "trap">> }
  | { ok: false; error: string }

export function validateComment(input: CommentInput): Validated {
  const name = (input.name ?? "").trim()
  const body = (input.body ?? "").trim()
  const email = (input.email ?? "").trim()
  const postSlug = (input.postSlug ?? "").trim()
  const parentId = (input.parentId ?? "") || null

  // A bot filled the honeypot. Valid, but nothing is written — and the caller
  // reports success so the bot does not learn to leave the field alone.
  if ((input.trap ?? "").trim()) {
    return { ok: true, drop: true, value: { postSlug, name, body, email, parentId } }
  }

  if (!postSlug) return { ok: false, error: "Something went wrong — reload the page." }
  if (!name) return { ok: false, error: "Please add your name." }
  if (name.length > MAX_NAME) return { ok: false, error: "That name is too long." }
  if (!body) return { ok: false, error: "Write a comment first." }
  if (body.length > MAX_BODY) {
    return { ok: false, error: `That is longer than ${MAX_BODY} characters.` }
  }
  if (email && !email.includes("@")) {
    return { ok: false, error: "That email address does not look right." }
  }

  return { ok: true, drop: false, value: { postSlug, name, body, email, parentId } }
}

/**
 * Write the comment. `is_staff` is never set from here — only a signed-in
 * admin wears the FOUNDATION badge, and the insert policy rejects it from an
 * anonymous client regardless. This is the second lock on that door.
 */
export async function insertComment(
  client: SupabaseClient,
  input: CommentInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = validateComment(input)
  if (!v.ok) return { ok: false, error: v.error }
  if (v.drop) return { ok: true }

  const { error } = await client.from("comments").insert({
    post_slug: v.value.postSlug,
    parent_id: v.value.parentId,
    name: v.value.name,
    email: v.value.email || null,
    body: v.value.body,
    is_staff: false,
    like_count: 0,
  })

  if (error) {
    console.error("[insertComment]", error.code, error.message)
    return { ok: false, error: "Your comment could not be saved. Please try again." }
  }
  return { ok: true }
}
